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

    // Pagamento aprovado -> tenta gerar a etiqueta
    if (ME_TOKEN && REMETENTE.postal_code) {
      try {
        await gerarEtiqueta(pay);
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

type Pay = {
  metadata?: Record<string, unknown>;
  external_reference?: string;
  payer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    identification?: { number?: string };
    phone?: { number?: string };
    address?: {
      zip_code?: string;
      street_name?: string;
      street_number?: string;
    };
  };
};

/** Fluxo Melhor Envio: adiciona ao carrinho -> checkout -> gera etiqueta. */
async function gerarEtiqueta(pay: Pay) {
  const meta = pay.metadata ?? {};
  const payer = pay.payer ?? {};
  const cep = String(meta.cep || payer.address?.zip_code || "").replace(/\D/g, "");

  const headers = {
    Authorization: `Bearer ${ME_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": UA,
  };

  // 1) Adiciona ao carrinho
  const cartPayload = {
    service: Number(meta.frete_servico_id) || undefined,
    from: REMETENTE,
    to: {
      name:
        `${payer.first_name ?? ""} ${payer.last_name ?? ""}`.trim() || "Cliente",
      phone: payer.phone?.number || "",
      email: payer.email || "",
      document: payer.identification?.number || "", // CPF do destinatário
      postal_code: cep,
      address: payer.address?.street_name || "", // TODO: coletar no formulário
      number: payer.address?.street_number || "",
      district: "", // TODO: coletar no formulário de entrega
      city: "", // TODO
      state_abbr: "", // TODO
    },
    products: [
      {
        name: `SIS Beauty (${meta.descricao ?? "Tratamento capilar"})`,
        quantity: 1,
        unitary_value: Number(meta.total) || 97,
      },
    ],
    volumes: [{ height: 12, width: 13, length: 9, weight: 0.4 }],
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

  // 2) Checkout (compra o frete) — descomente quando tiver saldo/dados completos
  // await fetch(`${ME_BASE}/api/v2/me/shipment/checkout`, {
  //   method: "POST", headers, body: JSON.stringify({ orders: [cart.id] }),
  // });

  // 3) Gerar etiqueta
  // await fetch(`${ME_BASE}/api/v2/me/shipment/generate`, {
  //   method: "POST", headers, body: JSON.stringify({ orders: [cart.id] }),
  // });

  console.log(`[ME] item no carrinho (order ${cart.id}) para ${pay.external_reference}`);
}
