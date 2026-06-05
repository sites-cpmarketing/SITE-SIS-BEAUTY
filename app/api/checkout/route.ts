import { getOferta } from "@/lib/produtos";
import { buscarCupom, aplicarCupom } from "@/lib/cupons";

const MP_TOKEN = process.env.MP_ACCESS_TOKEN;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ofertaId, descricao, endereco, qtdGoma, qtdCapsula } = body;
    const e = (endereco ?? {}) as Record<string, string>;
    const unidades = Math.max(1, (Number(qtdGoma) || 0) + (Number(qtdCapsula) || 0));
    const soDigitos = (v?: string) => String(v ?? "").replace(/\D/g, "");

    if (!MP_TOKEN) {
      return Response.json(
        { error: "Pagamento ainda não configurado. Adicione MP_ACCESS_TOKEN no .env." },
        { status: 500 }
      );
    }

    // ── URL base para back_urls (redirects — browser segue 308)
    const host      = req.headers.get("host") || "";
    const proto     = host.includes("localhost") ? "http" : "https";
    const BASE      = process.env.APP_URL || `${proto}://${host}`;

    // ── URL para notification_url: SEMPRE usa o Host do request
    // O MP não segue redirects — se sisbeauty.com.br redireciona para www,
    // o webhook nunca chega. Usando o Host do request garantimos a URL exata
    // que o Vercel serve, sem passar por redirect.
    const WEBHOOK_BASE = `${proto}://${host}`;

    // ── Preço calculado NO SERVIDOR ──
    const oferta = getOferta(ofertaId);
    if (!oferta) {
      return Response.json({ error: "Oferta inválida." }, { status: 400 });
    }
    const cupom = buscarCupom(body.cupom);
    const total = aplicarCupom(oferta.precoPor, cupom);

    const ref = `SIS-${ofertaId}-${Date.now()}`;

    type Item = { title: string; quantity: number; unit_price: number; currency_id: string };
    const items: Item[] = [
      {
        title: `SIS Beauty (${descricao}) · Frete grátis`,
        quantity: 1,
        unit_price: total,
        currency_id: "BRL",
      },
    ];

    const preference = {
      items,
      external_reference: ref,
      payer: {
        name:  e.nome  || undefined,
        email: e.email || undefined,
        phone: e.telefone
          ? { area_code: soDigitos(e.telefone).slice(0, 2),
              number:     soDigitos(e.telefone).slice(2) }
          : undefined,
        identification: soDigitos(e.cpf).length === 11
          ? { type: "CPF", number: soDigitos(e.cpf) }
          : undefined,
        address: {
          zip_code:      soDigitos(e.cep) || undefined,
          street_name:   e.rua            || undefined,
          street_number: e.numero         || undefined,
        },
      },
      back_urls: {
        success: `${BASE}/obrigado`,
        failure: `${BASE}/?pagamento=falhou`,
        pending: `${BASE}/obrigado?status=pendente`,
      },
      // "all" redireciona tanto para approved (cartão) quanto pending (PIX/boleto)
      // Sem isso o PIX fica preso na tela do MP após o pagamento
      ...(BASE.startsWith("https://") ? { auto_return: "all" } : {}),
      // notification_url usa WEBHOOK_BASE (Host do request, sem redirect)
      notification_url: `${WEBHOOK_BASE}/api/webhook/mercadopago`,
      statement_descriptor: "SISBEAUTY",
      payment_methods: {
        excluded_payment_types:   [],
        excluded_payment_methods: [],
        installments: 12,
        default_installments: 1,
      },
      metadata: {
        oferta_id:       ofertaId,
        descricao,
        total,
        unidades,
        cupom:           cupom?.codigo ?? "",
        end_nome:        e.nome        ?? "",
        end_email:       e.email       ?? "",   // ← e-mail coletado no checkout
        end_cpf:         soDigitos(e.cpf),
        end_telefone:    soDigitos(e.telefone),
        end_cep:         soDigitos(e.cep),
        end_rua:         e.rua         ?? "",
        end_numero:      e.numero      ?? "",
        end_complemento: e.complemento ?? "",
        end_bairro:      e.bairro      ?? "",
        end_cidade:      e.cidade      ?? "",
        end_uf:          e.uf          ?? "",
      },
    };

    const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const data = await r.json();
    if (!data?.init_point) {
      return Response.json(
        { error: "Falha ao criar a preferência de pagamento", detalhe: data },
        { status: 502 }
      );
    }

    console.log(`[checkout] preferência criada: ${data.id} | notification_url: ${WEBHOOK_BASE}/api/webhook/mercadopago`);
    return Response.json({ init_point: data.init_point, id: data.id, ref });
  } catch {
    return Response.json({ error: "Erro interno no checkout" }, { status: 500 });
  }
}
