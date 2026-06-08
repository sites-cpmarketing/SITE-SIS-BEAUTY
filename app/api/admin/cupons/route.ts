import { NextResponse } from "next/server";
import { CUPONS } from "@/lib/cupons";
import {
  listarCuponsKV,
  criarCupomKV,
  atualizarCupomKV,
  deletarCupomKV,
  kvConfigurado,
} from "@/lib/cupons-admin";
import type { Cupom } from "@/lib/cupons";

function autenticado(req: Request): boolean {
  const rawCookie = req.headers.get("cookie") ?? "";
  const token = rawCookie
    .split(";")
    .find((c) => c.trim().startsWith("sis-admin="))
    ?.split("=")
    .slice(1)
    .join("=")
    .trim();
  return !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

export async function GET(req: Request) {
  if (!autenticado(req))
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const [dinamicos, kvOk] = await Promise.all([
    listarCuponsKV(),
    kvConfigurado(),
  ]);

  return NextResponse.json({ estaticos: CUPONS, dinamicos, kvOk });
}

export async function POST(req: Request) {
  if (!autenticado(req))
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  try {
    const body = await req.json();

    const cupom: Cupom = {
      codigo: String(body.codigo ?? "")
        .toUpperCase()
        .trim(),
      tipo: body.tipo === "fixo" ? "fixo" : "percentual",
      valor: Number(body.valor),
      descricao: String(body.descricao ?? "").trim(),
      ativo: body.ativo !== false,
      ...(body.expira ? { expira: String(body.expira) } : {}),
      ...(body.minimo ? { minimo: Number(body.minimo) } : {}),
    };

    if (!cupom.codigo) throw new Error("Código obrigatório.");
    if (!cupom.valor || cupom.valor <= 0) throw new Error("Valor inválido.");
    if (!cupom.descricao) throw new Error("Descrição obrigatória.");

    // Conflito com cupons fixos
    if (CUPONS.some((c) => c.codigo === cupom.codigo)) {
      return NextResponse.json(
        { erro: `"${cupom.codigo}" já existe nos cupons fixos.` },
        { status: 409 }
      );
    }

    await criarCupomKV(cupom);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Erro ao criar cupom." },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  if (!autenticado(req))
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  try {
    const { codigo, ...dados } = await req.json();
    if (!codigo) throw new Error("Código obrigatório.");
    await atualizarCupomKV(String(codigo).toUpperCase(), dados);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Erro ao atualizar." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!autenticado(req))
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  try {
    const { codigo } = await req.json();
    if (!codigo) throw new Error("Código obrigatório.");
    await deletarCupomKV(String(codigo).toUpperCase());
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : "Erro ao deletar." },
      { status: 400 }
    );
  }
}
