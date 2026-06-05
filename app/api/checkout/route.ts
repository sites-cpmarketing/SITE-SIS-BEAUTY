import { getOferta } from "@/lib/produtos";
import { buscarCupom, aplicarCupom } from "@/lib/cupons";

const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ofertaId, descricao, endereco, qtdGoma, qtdCapsula } = body;
    const e = (endereco ?? {}) as Record<string, string>;
    // Total de potes do pedido — usado pelo webhook p/ dimensionar a caixa/peso
    const unidades = Math.max(1, (Number(qtdGoma) || 0) + (Number(qtdCapsula) || 0));
    const soDigitos = (v?: string) => String(v ?? "").replace(/\D/g, "");

    if (!MP_TOKEN) {
      return Response.json(
        { error: "Pagamento ainda não configurado. Adicione MP_ACCESS_TOKEN no .env." },
        { status: 500 }
      );
    }

    // ── Preço calculado NO SERVIDOR (nunca confie no valor vindo do cliente) ──
    const oferta = getOferta(ofertaId);
    if (!oferta) {
      return Response.json({ error: "Oferta inválida." }, { status: 400 });
    }
    const cupom = buscarCupom(body.cupom);
    const total = aplicarCupom(oferta.precoPor, cupom);

    const ref = `SIS-${ofertaId}-${Date.now()}`;

    type Item = { title: string; quantity: number; unit_price: number; currency_id: string };
    // Frete grátis: o cliente paga apenas o produto (já com o desconto do cupom).
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
      // Pré-preenche os dados do comprador no checkout do Mercado Pago
      payer: {
        name: e.nome || undefined,
        phone: e.telefone ? { number: soDigitos(e.telefone) } : undefined,
        identification: e.cpf
          ? { type: "CPF", number: soDigitos(e.cpf) }
          : undefined,
        address: {
          zip_code: soDigitos(e.cep),
          street_name: e.rua || undefined,
          street_number: e.numero || undefined,
        },
      },
      back_urls: {
        success: `${APP_URL}/obrigado`,
        failure: `${APP_URL}/?pagamento=falhou`,
        pending: `${APP_URL}/obrigado?status=pendente`,
      },
      // auto_return exige back_urls https (não funciona em http/localhost)
      ...(APP_URL.startsWith("https://") ? { auto_return: "approved" } : {}),
      notification_url: `${APP_URL}/api/webhook/mercadopago`,
      statement_descriptor: "SISBEAUTY",
      // Endereço completo no metadata — o webhook usa p/ gerar a etiqueta
      metadata: {
        oferta_id: ofertaId,
        descricao,
        total,
        unidades,
        cupom: cupom?.codigo ?? "",
        end_nome: e.nome ?? "",
        end_cpf: soDigitos(e.cpf),
        end_telefone: soDigitos(e.telefone),
        end_cep: soDigitos(e.cep),
        end_rua: e.rua ?? "",
        end_numero: e.numero ?? "",
        end_complemento: e.complemento ?? "",
        end_bairro: e.bairro ?? "",
        end_cidade: e.cidade ?? "",
        end_uf: e.uf ?? "",
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

    return Response.json({ init_point: data.init_point, id: data.id, ref });
  } catch {
    return Response.json({ error: "Erro interno no checkout" }, { status: 500 });
  }
}
