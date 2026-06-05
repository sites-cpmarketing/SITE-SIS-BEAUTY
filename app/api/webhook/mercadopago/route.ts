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

const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
const ME_BASE = process.env.MELHOR_ENVIO_URL || "https://www.melhorenvio.com.br";
const ME_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const UA = process.env.MELHOR_ENVIO_UA || "SIS Beauty (contato@sisbeauty.com.br)";

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
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    const type =
      (body as { type?: string }).type || url.searchParams.get("type");
    const paymentId =
      (body as { data?: { id?: string } }).data?.id ||
      url.searchParams.get("data.id");

    // Só nos interessa evento de pagamento
    if (type !== "payment" || !paymentId) {
      return Response.json({ ok: true, ignored: true });
    }
    // Valida a assinatura do MP (se MP_WEBHOOK_SECRET estiver configurado)
    if (!assinaturaValida(req, String(paymentId))) {
      return Response.json({ error: "assinatura inválida" }, { status: 401 });
    }
    if (!MP_TOKEN) return Response.json({ ok: true });

    // Consulta o pagamento
    const pr = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${MP_TOKEN}` } }
    );
    const pay = await pr.json();

    if (pay?.status !== "approved") {
      return Response.json({ ok: true, status: pay?.status ?? "desconhecido" });
    }

    // Pagamento aprovado — resolve os dados do pedido uma única vez
    const meta = await resolverMetadata(pay as Pay);

    // 1) E-mails: confirmação ao cliente + registro do pedido p/ a loja
    try {
      await enviarEmailsPedido(montarDadosEmail(pay as Pay, meta));
    } catch (e) {
      console.error("[webhook] erro ao enviar e-mails:", e);
    }

    // 2) Etiqueta no Melhor Envio
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
  if (!secret) return true;

  const xSig = req.headers.get("x-signature") || "";
  const xReqId = req.headers.get("x-request-id") || "";
  const parts: Record<string, string> = {};
  for (const p of xSig.split(",")) {
    const [k, v] = p.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  }
  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${xReqId};ts:${parts.ts};`;
  const hmac = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  try {
    return (
      hmac.length === parts.v1.length &&
      crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(parts.v1))
    );
  } catch {
    return false;
  }
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
    emailCliente: pay.payer?.email || "",
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

  // Escolhe um serviço que realmente entregue neste CEP/dimensão
  const service = await escolherServico(headers, cep, pkg);

  // 1) Adiciona ao carrinho com o endereço coletado no checkout do site
  const cartPayload = {
    service,
    from: REMETENTE,
    to: {
      name: s("end_nome") || "Cliente",
      phone: s("end_telefone"),
      email: pay.payer?.email || "",
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
        name: `SIS Beauty (${s("descricao") || "Tratamento capilar"})`,
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
    const emailCliente = pay.payer?.email || "";
    const nome = s("end_nome") || "cliente";
    const servico = cart.service?.name as string | undefined;
    const descricao = s("descricao") || "pedido SIS Beauty";
    console.log(`[ME] etiqueta gerada — rastreio: ${tracking}`);
    if (emailCliente) {
      await enviarRastreio({ nome, emailCliente, codigo: tracking, servico, descricao })
        .catch((e) => console.error("[email] erro ao enviar rastreio:", e));
    }
  } else {
    console.warn("[ME] etiqueta gerada mas código de rastreio não retornado:", JSON.stringify(generated));
  }

  console.log(`[ME] item no carrinho (order ${cart.id}) para ${pay.external_reference}`);
}
