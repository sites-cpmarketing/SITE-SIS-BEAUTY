/**
 * Webhook do Mercado Pago.
 * Quando um pagamento é APROVADO, dispara a geração da etiqueta no Melhor Envio.
 *
 * IMPORTANTE: para gerar a etiqueta o Melhor Envio exige os dados completos do
 * destinatário (nome, CPF/CNPJ, endereço com número e bairro). Esses dados
 * devem ser coletados no checkout do site (formulário de entrega) e salvos no
 * pedido — veja o RELATÓRIO/README para a próxima fase. Aqui já deixamos o
 * fluxo pronto (cart -> checkout -> generate), lendo o que estiver disponível.
 */

import crypto from "crypto";
import { pacoteParaQuantidade } from "@/lib/produtos";
import { enviarEmailsPedido, enviarRastreio, type DadosPedido } from "@/lib/email";
import { normalizarTelefone } from "@/lib/validacao";
import { reservarProcessamento } from "@/lib/idempotencia";

const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
const ME_BASE = process.env.MELHOR_ENVIO_URL || "https://www.melhorenvio.com.br";
const ME_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const UA = process.env.MELHOR_ENVIO_UA || "SIS Beauty (contato@sisbeauty.com.br)";

// ─── Idempotência: evita etiquetas duplicadas ───────────────────────────────
// O MP reenvia o webhook múltiplas vezes para o mesmo pagamento.
// Camada 1 (este Map): cobre a mesma instância Lambda quente — atalho rápido.
// Camada 2 (Redis SET NX em lib/idempotencia): trava atômica cross-instância,
//   é o que realmente garante etiqueta única quando as chamadas são simultâneas.
const DEDUP_TTL_MS = 4 * 60 * 60 * 1000; // 4 horas
const _processados = new Map<string, number>(); // paymentId → timestamp

function _jaProcessado(id: string): boolean {
  const ts = _processados.get(id);
  if (!ts) return false;
  if (Date.now() - ts > DEDUP_TTL_MS) { _processados.delete(id); return false; }
  return true;
}
function _marcarProcessado(id: string) {
  // limpa entradas expiradas ocasionalmente (evita crescimento infinito)
  if (_processados.size > 200) {
    const cutoff = Date.now() - DEDUP_TTL_MS;
    for (const [k, v] of _processados) { if (v < cutoff) _processados.delete(k); }
  }
  _processados.set(id, Date.now());
}

// Dados do REMETENTE (sua loja) — preencha no .env
const REMETENTE = {
  name: process.env.LOJA_NOME || "SIS Beauty",
  phone: process.env.LOJA_TELEFONE || "",
  email: process.env.LOJA_EMAIL || "contato@sisbeauty.com.br",
  document: process.env.LOJA_DOCUMENTO || "",
  postal_code: (process.env.CEP_ORIGEM || "").replace(/\D/g, ""),
  address: process.env.LOJA_ENDERECO || "",
  number: process.env.LOJA_NUMERO || "",
  district: process.env.LOJA_BAIRRO || "",
  city: process.env.LOJA_CIDADE || "",
  state_abbr: process.env.LOJA_UF || "",
};

export async function POST(req: Request) {
  try {
    const url  = new URL(req.url);
    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    // MP envia tanto via body JSON quanto via query string (formato legado)
    const type =
      (body as { type?: string }).type    ||
      url.searchParams.get("type")        ||
      url.searchParams.get("topic");

    const paymentId =
      (body as { data?: { id?: string } }).data?.id ||
      url.searchParams.get("data.id")               ||
      url.searchParams.get("id");

    console.log(`[webhook-mp] recebido | type=${type} | paymentId=${paymentId}`);

    // Só nos interessa evento de pagamento
    if (!paymentId || (type && type !== "payment")) {
      console.log(`[webhook-mp] ignorado | type=${type}`);
      return Response.json({ ok: true, ignored: true });
    }

    // Valida assinatura — apenas loga, não bloqueia.
    // A segurança real está na re-consulta do pagamento na API do MP:
    // mesmo que uma chamada falsa chegue, o status nunca será "approved".
    const sigOk = assinaturaValida(req, String(paymentId));
    if (!sigOk) {
      console.warn(`[webhook-mp] assinatura divergente para payment ${paymentId} — processando mesmo assim`);
    }

    if (!MP_TOKEN) {
      console.error("[webhook-mp] MP_ACCESS_TOKEN não configurado");
      return Response.json({ ok: true });
    }

    // Consulta o status real do pagamento na API do MP
    const pr  = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${MP_TOKEN}` } }
    );
    const pay = await pr.json();

    const status = pay?.status ?? "desconhecido";
    console.log(`[webhook-mp] payment ${paymentId} | status=${status} | method=${pay?.payment_type_id}`);

    if (status !== "approved") {
      // pending = aguardando pagamento | refunded = estornado | cancelled = cancelado
      console.log(`[webhook-mp] ignorando payment ${paymentId} — status: ${status}`);
      return Response.json({ ok: true, status });
    }

    // ── Idempotência: evita processar o mesmo pagamento duas vezes ──────────
    // O MP reenvia o webhook para o mesmo pagamento (notification_url da
    // preferência + webhook do painel), e as chamadas costumam cair em
    // instâncias serverless diferentes — quase simultâneas.
    //
    //  1) Map em memória: atalho rápido para a MESMA instância quente.
    //  2) reservarProcessamento (Redis SET NX): trava ATÔMICA e cross-instância
    //     — só a primeira chamada reserva o pagamento; as demais param aqui.
    //     É o que de fato impede as etiquetas duplicadas.
    if (_jaProcessado(paymentId!) || !(await reservarProcessamento(paymentId!))) {
      console.log(`[webhook-mp] payment ${paymentId} já processado (dedup) — ignorando.`);
      return Response.json({ ok: true, dedup: true });
    }
    // Marca em memória para bloquear chamadas concorrentes na mesma instância
    _marcarProcessado(paymentId!);

    // Pagamento aprovado — resolve os dados do pedido uma única vez
    const meta = await resolverMetadata(pay as Pay);

    // 1) Webhook de confirmação de pagamento (Make / n8n / Zapier)
    try {
      await dispararWebhookPagamento(pay as Pay, meta);
    } catch (e) {
      console.error("[webhook] erro ao notificar webhook de pagamento:", e);
    }

    // 2) E-mails: confirmação ao cliente + registro do pedido p/ a loja
    try {
      await enviarEmailsPedido(montarDadosEmail(pay as Pay, meta));
    } catch (e) {
      console.error("[webhook] erro ao enviar e-mails:", e);
    }

    // 3) Etiqueta no Melhor Envio
    if (ME_TOKEN && REMETENTE.postal_code) {
      try {
        await gerarEtiqueta(pay as Pay, meta);
      } catch (e) {
        console.error("[webhook] erro ao gerar etiqueta:", e);
        // não falha o webhook — etiqueta pode ser gerada manualmente depois
      }
    }

    return Response.json({ ok: true, status: "approved" });
  } catch {
    // Sempre 200 para o MP não reenviar em loop
    return Response.json({ ok: true });
  }
}

// Serviço de envio padrão do Melhor Envio (1 = PAC, 2 = SEDEX). Configurável.
const SERVICO_PADRAO = Number(process.env.MELHOR_ENVIO_SERVICO) || 1;

type Meta = Record<string, unknown>;
type Pay = {
  metadata?: Meta;
  external_reference?: string;
  order?: { id?: string | number };
  payer?: { email?: string };
};

/**
 * Valida a assinatura do webhook do Mercado Pago (cabeçalho x-signature).
 * Se MP_WEBHOOK_SECRET não estiver configurado, não bloqueia (compatibilidade).
 * Configure o secret no painel do MP > Webhooks e no .env.
 */
function assinaturaValida(req: Request, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  // Sem secret configurado → aceita tudo (retrocompatível)
  if (!secret) return true;

  const xSig   = req.headers.get("x-signature")  || "";
  const xReqId = req.headers.get("x-request-id") || "";

  // Sem cabeçalho de assinatura → aceita (MP às vezes não envia em notificações de teste)
  if (!xSig) {
    console.warn("[webhook-mp] x-signature ausente — aceitando sem validação");
    return true;
  }

  const parts: Record<string, string> = {};
  for (const p of xSig.split(",")) {
    const idx = p.indexOf("=");
    if (idx > 0) parts[p.slice(0, idx).trim()] = p.slice(idx + 1).trim();
  }

  if (!parts.ts || !parts.v1) {
    console.warn("[webhook-mp] x-signature malformado:", xSig);
    return true; // não bloqueia por cabeçalho malformado
  }

  // Formato oficial MP: id:{data.id};request-id:{x-request-id};ts:{ts};
  const manifest = `id:${dataId};request-id:${xReqId};ts:${parts.ts};`;
  const hmac     = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    const valid = hmac.length === parts.v1.length &&
      crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(parts.v1));
    if (!valid) console.warn("[webhook-mp] HMAC divergente (secret Vercel ≠ MP dashboard) | manifest:", manifest);
    return valid;
  } catch {
    return false;
  }
}

/** Resolve o e-mail do cliente: metadata tem prioridade sobre payer.email do MP.
 *  PIX frequentemente retorna e-mail mascarado (***@***.com) via payer — usar
 *  o e-mail coletado no formulário do checkout é mais confiável. */
function resolverEmailCliente(pay: Pay, meta: Meta): string {
  const s = (k: string) => String(meta[k] ?? "");
  const emailMeta = s("end_email");
  if (emailMeta && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailMeta) && !emailMeta.includes("*")) {
    return emailMeta;
  }
  const emailPayer = pay.payer?.email ?? "";
  if (emailPayer && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailPayer) && !emailPayer.includes("*")) {
    return emailPayer;
  }
  return "";
}

/** Monta os dados do pedido para os e-mails a partir do metadata. */
function montarDadosEmail(pay: Pay, meta: Meta): DadosPedido {
  const s = (k: string) => String(meta[k] ?? "");
  const complemento = s("end_complemento") ? ` - ${s("end_complemento")}` : "";
  const endereco = [
    `${s("end_rua")}, ${s("end_numero")}${complemento}`,
    `${s("end_bairro")} — ${s("end_cidade")}/${s("end_uf")}`,
    `CEP ${s("end_cep")}`,
  ].join("<br/>");
  const total = (Number(meta.total) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return {
    ref: pay.external_reference,
    nome: s("end_nome"),
    emailCliente: resolverEmailCliente(pay, meta),
    descricao: s("descricao") || "Tratamento capilar",
    total,
    endereco,
    telefone: s("end_telefone"),
    cpf: s("end_cpf"),
  };
}

/**
 * O metadata definido na preference nem sempre volta no objeto de pagamento.
 * Se faltar, recupera a preference via merchant_order para ler o endereço.
 */
async function resolverMetadata(pay: Pay): Promise<Meta> {
  const meta = pay.metadata ?? {};
  if (meta.end_cep) return meta;
  try {
    const orderId = pay.order?.id;
    if (!orderId) return meta;
    const auth = { Authorization: `Bearer ${MP_TOKEN}` };
    const mo = await fetch(
      `https://api.mercadopago.com/merchant_orders/${orderId}`,
      { headers: auth }
    ).then((r) => r.json());
    const prefId = mo?.preference_id;
    if (!prefId) return meta;
    const pref = await fetch(
      `https://api.mercadopago.com/checkout/preferences/${prefId}`,
      { headers: auth }
    ).then((r) => r.json());
    return (pref?.metadata as Meta) ?? meta;
  } catch (e) {
    console.error("[webhook] não recuperou metadata da preference:", e);
    return meta;
  }
}

type MEServico = {
  id: number;
  name?: string;
  price?: string;
  delivery_time?: number;
  error?: string;
};
type Pacote = ReturnType<typeof pacoteParaQuantidade>;

/**
 * Calcula o frete real para o destino e escolhe um serviço que ATENDA o trecho.
 * Sem isso, um service fixo (ex.: PAC) falharia quando a transportadora não
 * cobre o CEP ou as dimensões estouram o limite, deixando o pedido sem etiqueta.
 *
 * Preferência: serviço padrão (.env) → mais barato dos Correios (PAC/SEDEX)
 *              → mais barato de qualquer transportadora disponível.
 */
async function escolherServico(
  headers: Record<string, string>,
  cepDestino: string,
  pkg: Pacote
): Promise<number> {
  try {
    const r = await fetch(`${ME_BASE}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: { postal_code: REMETENTE.postal_code },
        to: { postal_code: cepDestino },
        package: {
          height: pkg.height,
          width: pkg.width,
          length: pkg.length,
          weight: pkg.weight,
        },
      }),
    });
    const data = (await r.json()) as MEServico[] | unknown;
    if (!Array.isArray(data)) return SERVICO_PADRAO;

    // Só serviços que realmente atendem (sem erro e com preço válido)
    const ok = data.filter((x) => !x.error && Number(x.price) > 0);
    if (ok.length === 0) {
      console.error("[ME] nenhum serviço atende o trecho — usando padrão", cepDestino);
      return SERVICO_PADRAO;
    }
    // 1) serviço padrão, se disponível
    if (ok.some((x) => x.id === SERVICO_PADRAO)) return SERVICO_PADRAO;
    // 2) Correios (PAC=1 / SEDEX=2) mais barato disponível
    const correios = ok
      .filter((x) => x.id === 1 || x.id === 2)
      .sort((a, b) => Number(a.price) - Number(b.price));
    if (correios.length) return correios[0].id;
    // 3) opção mais barata de qualquer transportadora que atenda
    const maisBarato = [...ok].sort((a, b) => Number(a.price) - Number(b.price))[0];
    console.warn(`[ME] PAC/SEDEX indisponíveis p/ ${cepDestino} — usando ${maisBarato.name} (id ${maisBarato.id})`);
    return maisBarato.id;
  } catch (e) {
    console.error("[ME] erro ao calcular serviço — usando padrão:", e);
    return SERVICO_PADRAO;
  }
}

/**
 * Dispara o webhook de confirmação de pagamento para CHECKOUT_WEBHOOK_URL.
 * O payload inclui todos os dados do checkout + status do pagamento.
 * O campo "fonte" diferencia este evento do lead inicial (fonte: "checkout").
 */
async function dispararWebhookPagamento(pay: Pay, meta: Meta) {
  const url = process.env.CHECKOUT_WEBHOOK_URL;
  if (!url) {
    console.log("[webhook] CHECKOUT_WEBHOOK_URL não configurado — confirmação ignorada.");
    return;
  }

  const s = (k: string) => String(meta[k] ?? "");
  const total = Number(meta.total) || 0;
  const complemento = s("end_complemento") ? ` - ${s("end_complemento")}` : "";

  const payload = {
    fonte:           "pagamento_confirmado",
    status:          "aprovado",
    // ── Identificação do pagamento ──
    pagamento_id:    String((pay as Record<string, unknown>).id ?? ""),
    referencia:      pay.external_reference ?? "",
    data_pagamento:  new Date().toISOString(),
    // ── Dados do comprador ──
    nome:            s("end_nome"),
    email:           resolverEmailCliente(pay, meta),
    telefone:        normalizarTelefone(s("end_telefone")),
    cpf:             s("end_cpf"),
    // ── Endereço de entrega ──
    cep:             s("end_cep"),
    rua:             s("end_rua"),
    numero:          s("end_numero"),
    complemento:     s("end_complemento"),
    bairro:          s("end_bairro"),
    cidade:          s("end_cidade"),
    uf:              s("end_uf"),
    endereco_completo: `${s("end_rua")}, ${s("end_numero")}${complemento} — ${s("end_bairro")}, ${s("end_cidade")}/${s("end_uf")} — CEP ${s("end_cep")}`,
    // ── Pedido ──
    produto:         s("descricao") || "Tratamento capilar",
    total:           total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    total_numerico:  total,
    cupom:           s("cupom"),
    origem:          "SIS Beauty",
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    console.error("[webhook] falha ao notificar pagamento:", r.status, await r.text().catch(() => ""));
  } else {
    console.log("[webhook] confirmação de pagamento enviada com sucesso.");
  }
}

/**
 * Pesquisa se já existe um item no ME associado a este pedido.
 * Usamos o campo `products[0].name` com o prefixo "REF:" para identificar.
 * Se encontrar resultado, não precisamos criar outra etiqueta.
 */
async function etiquetaJaExiste(
  headers: Record<string, string>,
  extRef: string
): Promise<boolean> {
  if (!extRef) return false;
  try {
    const tag = `REF:${extRef}`;
    const r = await fetch(
      `${ME_BASE}/api/v2/me/orders?q=${encodeURIComponent(tag)}&per_page=5`,
      { headers }
    );
    if (!r.ok) return false;
    const data = await r.json();
    // A resposta é paginada: { data: [...], meta: {...} }
    const items: unknown[] = Array.isArray(data) ? data : (data?.data ?? []);
    return items.length > 0;
  } catch {
    return false; // em caso de erro, deixa criar (melhor duplicado que perdido)
  }
}

/** Fluxo Melhor Envio: adiciona ao carrinho -> checkout -> gera etiqueta. */
async function gerarEtiqueta(pay: Pay, meta: Meta) {
  const s = (k: string) => String(meta[k] ?? "");
  const cep = s("end_cep").replace(/\D/g, "");
  // Caixa e peso reais conforme a quantidade de potes do pedido
  const unidades = Math.max(1, Number(meta.unidades) || 1);
  const pkg = pacoteParaQuantidade(unidades);

  const headers = {
    Authorization: `Bearer ${ME_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": UA,
  };

  // ── Verificação cross-instância: etiqueta já existe no ME? ───────────────
  const extRef = pay.external_reference ?? "";
  if (extRef && await etiquetaJaExiste(headers, extRef)) {
    console.log(`[ME] etiqueta já existe para referência "${extRef}" — pulando criação duplicada.`);
    return;
  }

  // Escolhe um serviço que realmente entregue neste CEP/dimensão
  const service = await escolherServico(headers, cep, pkg);

  // PIX muitas vezes não retorna pay.payer.email — ME exige e-mail válido.
  // Fallback para o e-mail da loja para não travar a geração da etiqueta.
  const emailDestinatario = pay.payer?.email?.includes("@")
    ? pay.payer.email
    : (process.env.LOJA_EMAIL || "contato@sisbeauty.com.br");

  // 1) Adiciona ao carrinho com o endereço coletado no checkout do site
  const cartPayload = {
    service,
    from: REMETENTE,
    to: {
      name: s("end_nome") || "Cliente",
      phone: s("end_telefone"),
      email: emailDestinatario,
      document: s("end_cpf"), // CPF do destinatário
      postal_code: cep,
      address: s("end_rua"),
      number: s("end_numero"),
      complement: s("end_complemento"),
      district: s("end_bairro"),
      city: s("end_cidade"),
      state_abbr: s("end_uf"),
    },
    products: [
      {
        // O prefixo "REF:{external_reference}" permite detectar etiquetas duplicadas
        // pesquisando /api/v2/me/orders?q=REF:{extRef} antes de criar novas.
        name: `SIS Beauty (${s("descricao") || "Tratamento capilar"}) REF:${extRef || "sem-ref"}`,
        quantity: 1,
        unitary_value: Number(meta.total) || 97,
      },
    ],
    volumes: [{ height: pkg.height, width: pkg.width, length: pkg.length, weight: pkg.weight }],
    options: {
      insurance_value: Number(meta.total) || 97,
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: true,
      invoice: { key: "" },
    },
  };

  const cartRes = await fetch(`${ME_BASE}/api/v2/me/cart`, {
    method: "POST",
    headers,
    body: JSON.stringify(cartPayload),
  });
  const cart = await cartRes.json();
  if (!cart?.id) {
    console.error("[ME] falha ao adicionar ao carrinho:", cart);
    return;
  }

  // 2) Checkout (compra o frete)
  const checkoutRes = await fetch(`${ME_BASE}/api/v2/me/shipment/checkout`, {
    method: "POST", headers, body: JSON.stringify({ orders: [cart.id] }),
  });
  if (!checkoutRes.ok) {
    const err = await checkoutRes.json().catch(() => null);
    console.error("[ME] falha no checkout do frete:", err);
    return;
  }

  // 3) Gerar etiqueta
  const genRes = await fetch(`${ME_BASE}/api/v2/me/shipment/generate`, {
    method: "POST", headers, body: JSON.stringify({ orders: [cart.id] }),
  });
  const generated = await genRes.json().catch(() => null);

  // 4) Extrair código de rastreio e notificar o cliente
  // A resposta do /generate é um objeto { [orderId]: { tracking: "AA123BR", ... } }
  const orderData = generated?.[cart.id] as Record<string, unknown> | undefined;
  const tracking = (orderData?.tracking as string) || (orderData?.tracking_code as string);

  if (tracking) {
    // Usa resolverEmailCliente para priorizar o e-mail digitado no checkout
    // (pay.payer?.email do PIX vem vazio ou mascarado — meta.end_email é mais confiável)
    const emailCliente = resolverEmailCliente(pay, meta);
    const nome = s("end_nome") || "cliente";
    const servico = cart.service?.name as string | undefined;
    const descricao = s("descricao") || "pedido SIS Beauty";
    console.log(`[ME] etiqueta gerada — rastreio: ${tracking} | email rastreio: ${emailCliente || "(sem email)"}`);
    if (emailCliente) {
      await enviarRastreio({ nome, emailCliente, codigo: tracking, servico, descricao })
        .catch((e) => console.error("[email] erro ao enviar rastreio:", e));
    }
  } else {
    console.warn("[ME] etiqueta gerada mas código de rastreio não retornado:", JSON.stringify(generated));
  }

  console.log(`[ME] item no carrinho (order ${cart.id}) para ${pay.external_reference}`);
}
