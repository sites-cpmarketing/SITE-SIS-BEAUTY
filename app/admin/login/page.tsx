"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginAdmin() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const r = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });

      if (r.ok) {
        router.push("/admin/cupons");
      } else {
        const d = await r.json();
        setErro(d.erro ?? "Erro ao entrar.");
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-perola rounded-3xl shadow-soft p-8">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose mb-2">
            SIS Beauty
          </p>
          <h1 className="text-2xl text-cacau">Área administrativa</h1>
          <p className="text-sm text-cacau-soft mt-1">Acesso restrito</p>
        </div>

        <form onSubmit={entrar} className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-cacau-soft mb-1 block">
              Senha de acesso
            </span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-xl border-2 border-rose-light bg-white px-4 py-3 outline-none focus:border-rose"
              required
            />
          </label>

          {erro && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full rounded-full py-3.5 font-semibold disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
