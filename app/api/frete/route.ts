import { pacoteParaQuantidade } from "@/lib/produtos";

const BASE = process.env.MELHOR_ENVIO_URL || "https://www.melhorenvio.com.br";
const TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const CEP_ORIGEM = (process.env.CEP_ORIGEM || "").replace(/\D/g, "");
const UA = process.env.MELHOR_ENVIO_UA || "SIS Beauty (contato@sisbeauty.com.br)";

type MEService = {
  id: number;
  name: string;
  price: string;
  delivery_time: number;
  company?: { name: string };
  error?: string;
};

export async function POST(req: Request) {
  try {
    const { cep, unidades } = await req.json();
    const to = String(cep || "").replace(/\D/g, "");
    if (to.length !== 8)
      return Response.json({ error: "CEP inválido" }, { status: 400 });

    const qtd = Math.max(1, Number(unidades) || 1);
    const pkg = pacoteParaQuantidade(qtd);

    // ----- Modo simulado: sem token, retorna estimativa p/ testar o fluxo -----
    if (!TOKEN || !CEP_ORIGEM) {
      const base = 18 + qtd * 4;
      return Response.json({
        simulado: true,
        opcoes: [
          { id: 1, nome: "PAC (estimado)", empresa: "Correios", preco: Number(base.toFixed(2)), prazo: 8 },
          { id: 2, nome: "SEDEX (estimado)", empresa: "Correios", preco: Number((base * 1.6).toFixed(2)), prazo: 3 },
        ],
      });
    }

    // ----- Cálculo real no Melhor Envio -----
    const r = await fetch(`${BASE}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": UA,
      },
      body: JSON.stringify({
        from: { postal_code: CEP_ORIGEM },
        to: { postal_code: to },
        package: {
          height: pkg.height,
          width: pkg.width,
          length: pkg.length,
          weight: pkg.weight,
        },
        options: { insurance_value: 0, receipt: false, own_hand: false },
      }),
    });

    const data = (await r.json()) as MEService[] | { message?: string };
    if (!Array.isArray(data)) {
      return Response.json(
        { error: "Falha ao calcular frete no Melhor Envio", detalhe: data },
        { status: 502 }
      );
    }

    // Mostrar apenas PAC (id 1) e SEDEX (id 2) dos Correios
    const SERVICOS_PERMITIDOS = [1, 2];
    const opcoes = data
      .filter(
        (s) =>
          SERVICOS_PERMITIDOS.includes(s.id) &&
          !s.error &&
          s.price &&
          Number(s.price) > 0
      )
      .map((s) => ({
        id: s.id,
        nome: s.name,
        empresa: s.company?.name ?? "",
        preco: Number(s.price),
        prazo: s.delivery_time,
      }))
      .sort((a, b) => a.preco - b.preco);

    return Response.json({ opcoes });
  } catch {
    return Response.json({ error: "Erro interno ao calcular o frete" }, { status: 500 });
  }
}
