const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ofertaId, descricao, precoProduto, frete, cep, total } = body;

    if (!MP_TOKEN) {
      return Response.json(
        { error: "Pagamento ainda não configurado. Adicione MP_ACCESS_TOKEN no .env." },
        { status: 500 }
      );
    }

    const ref = `SIS-${ofertaId}-${Date.now()}`;

    type Item = { title: string; quantity: number; unit_price: number; currency_id: string };
    const items: Item[] = [
      {
        title: `SIS Beauty (${descricao})`,
        quantity: 1,
        unit_price: Number(precoProduto),
        currency_id: "BRL",
      },
    ];
    if (frete?.preco > 0) {
      items.push({
        title: `Frete: ${frete.servico}`,
        quantity: 1,
        unit_price: Number(frete.preco),
        currency_id: "BRL",
      });
    }

    const preference = {
      items,
      external_reference: ref,
      back_urls: {
        success: `${APP_URL}/obrigado`,
        failure: `${APP_URL}/?pagamento=falhou`,
        pending: `${APP_URL}/obrigado?status=pendente`,
      },
      auto_return: "approved",
      notification_url: `${APP_URL}/api/webhook/mercadopago`,
      statement_descriptor: "SISBEAUTY",
      // Tudo que o webhook precisa para gerar a etiqueta depois:
      metadata: {
        oferta_id: ofertaId,
        descricao,
        cep,
        frete_servico_id: frete?.servicoId,
        frete_servico: frete?.servico,
        frete_preco: frete?.preco,
        frete_prazo: frete?.prazo,
        total,
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
