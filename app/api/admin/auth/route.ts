import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { senha } = await req.json();

    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_TOKEN) {
      return NextResponse.json(
        {
          erro: "Admin não configurado. Adicione ADMIN_PASSWORD e ADMIN_TOKEN nas variáveis de ambiente do Vercel.",
        },
        { status: 503 }
      );
    }

    if (senha !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ erro: "Senha incorreta." }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("sis-admin", process.env.ADMIN_TOKEN, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8, // 8 horas
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("sis-admin");
  return res;
}
