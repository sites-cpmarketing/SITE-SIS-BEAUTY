import { NextResponse } from "next/server";
import { buscarCupomServidor } from "@/lib/cupons-admin";

/**
 * POST /api/cupom
 * Valida um cupom contra os cupons estáticos E os dinâmicos (Redis).
 * Usado pelo cliente no checkout antes de ir para o pagamento.
 */
export async function POST(req: Request) {
  try {
    const { codigo, total } = await req.json();

    const cupom = await buscarCupomServidor(codigo, total);

    if (!cupom) {
      return NextResponse.json(
        { valido: false, motivo: "nao_encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ valido: true, cupom });
  } catch {
    return NextResponse.json(
      { valido: false, motivo: "nao_encontrado" },
      { status: 500 }
    );
  }
}
