"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Cupom } from "@/lib/cupons";

type Dados = {
  estaticos: Cupom[];
  dinamicos: Cupom[];
  kvOk: boolean;
};

const FORM_VAZIO = {
  codigo: "",
  tipo: "percentual" as Cupom["tipo"],
  valor: "",
  descricao: "",
  expira: "",
  minimo: "",
};

export default function AdminCupons() {
  const router = useRouter();
  const [dados, setDados] = useState<Dados | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const r = await fetch("/api/admin/cupons");
      if (r.status === 401) {
        router.push("/admin/login");
        return;
      }
      setDados(await r.json());
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function setF(k: keyof typeof FORM_VAZIO, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function criarCupom(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setSucesso("");
    setErro("");
    try {
      const r = await fetch("/api/admin/cupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: form.codigo,
          tipo: form.tipo,
          valor: Number(form.valor),
          descricao: form.descricao,
          ...(form.expira ? { expira: form.expira } : {}),
          ...(form.minimo ? { minimo: Number(form.minimo) } : {}),
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErro(d.erro ?? "Erro ao criar.");
        return;
      }
      setSucesso(`Cupom "${form.codigo.toUpperCase()}" criado com sucesso!`);
      setForm(FORM_VAZIO);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function toggleAtivo(cupom: Cupom) {
    await fetch("/api/admin/cupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: cupom.codigo, ativo: !cupom.ativo }),
    });
    await carregar();
  }

  async function apagar(codigo: string) {
    if (!confirm(`Apagar o cupom "${codigo}"? Esta ação não pode ser desfeita.`))
      return;
    await fetch("/api/admin/cupons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo }),
    });
    await carregar();
  }

  async function sair() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  const brlDesc = (c: Cupom) =>
    c.tipo === "percentual"
      ? `${c.valor}% de desconto`
      : `R$ ${c.valor.toFixed(2).replace(".", ",")} de desconto`;

  return (
    <main className="min-h-screen bg-cream p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose">
              SIS Beauty · Admin
            </p>
            <h1 className="text-2xl text-cacau">Cupons de desconto</h1>
          </div>
          <button
            onClick={sair}
            className="rounded-full border-2 border-rose-light px-4 py-2 text-sm text-cacau hover:bg-rose-light transition-colors"
          >
            Sair
          </button>
        </div>

        {/* Badge de status da conexão */}
        {dados && (
          <div
            className={`flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold ${
              dados.kvOk
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                dados.kvOk ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
            {dados.kvOk
              ? "Redis conectado — cupons salvos permanentemente"
              : "Redis não conectado — conecte o Upstash no Vercel para salvar cupons"}
          </div>
        )}

        {/* Formulário de criação */}
        <div className="rounded-3xl bg-perola p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-cacau mb-5">
            Criar novo cupom
          </h2>

          <form onSubmit={criarCupom} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Campo
                label="Código do cupom"
                value={form.codigo}
                onChange={(v) => setF("codigo", v.toUpperCase())}
                placeholder="EX: PROMO10"
                required
              />
              <div>
                <label className="block text-xs font-semibold text-cacau-soft mb-1">
                  Tipo de desconto
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) =>
                    setF("tipo", e.target.value as Cupom["tipo"])
                  }
                  className="w-full rounded-xl border-2 border-rose-light bg-white px-4 py-3 outline-none focus:border-rose text-sm"
                >
                  <option value="percentual">Percentual (%)</option>
                  <option value="fixo">Valor fixo (R$)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Campo
                label={form.tipo === "fixo" ? "Valor em R$" : "Percentual (%)"}
                value={form.valor}
                onChange={(v) => setF("valor", v)}
                placeholder={form.tipo === "fixo" ? "30" : "10"}
                inputMode="numeric"
                required
              />
              <Campo
                label="Descrição (exibida ao cliente)"
                value={form.descricao}
                onChange={(v) => setF("descricao", v)}
                placeholder="10% de desconto especial"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CampoData
                label="Expira em (opcional)"
                value={form.expira}
                onChange={(v) => setF("expira", v)}
              />
              <Campo
                label="Pedido mínimo R$ (opcional)"
                value={form.minimo}
                onChange={(v) => setF("minimo", v)}
                placeholder="200"
                inputMode="numeric"
              />
            </div>

            {sucesso && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                ✓ {sucesso}
              </p>
            )}
            {erro && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                ✗ {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={salvando || !dados?.kvOk}
              className="btn-primary rounded-full px-8 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvando ? "Salvando…" : "Criar cupom"}
            </button>
          </form>
        </div>

        {/* Cupons criados no painel */}
        <div className="rounded-3xl bg-perola p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-cacau mb-1">
            Cupons criados aqui
            {dados && (
              <span className="ml-2 text-sm font-normal text-cacau-soft">
                ({dados.dinamicos.length})
              </span>
            )}
          </h2>
          <p className="text-xs text-cacau-soft mb-4">
            Podem ser ativados, desativados ou apagados a qualquer momento.
          </p>

          {carregando ? (
            <p className="text-sm text-cacau-soft">Carregando…</p>
          ) : dados?.dinamicos.length === 0 ? (
            <p className="text-sm text-cacau-soft italic">
              Nenhum cupom criado ainda. Use o formulário acima.
            </p>
          ) : (
            <div className="space-y-2">
              {dados?.dinamicos.map((c) => (
                <CupomRow
                  key={c.codigo}
                  cupom={c}
                  desc={brlDesc(c)}
                  onToggle={() => toggleAtivo(c)}
                  onDelete={() => apagar(c.codigo)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cupons fixos (read-only) */}
        <div className="rounded-3xl bg-perola p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-cacau mb-1">
            Cupons fixos
            {dados && (
              <span className="ml-2 text-sm font-normal text-cacau-soft">
                ({dados.estaticos.length})
              </span>
            )}
          </h2>
          <p className="text-xs text-cacau-soft mb-4">
            Estes cupons estão no código-fonte. Para editar, peça ao desenvolvedor.
          </p>

          {carregando ? (
            <p className="text-sm text-cacau-soft">Carregando…</p>
          ) : (
            <div className="space-y-2">
              {dados?.estaticos.map((c) => (
                <CupomRow key={c.codigo} cupom={c} desc={brlDesc(c)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* ─── Sub-componentes ──────────────────────────────────────────────── */

function CupomRow({
  cupom,
  desc,
  onToggle,
  onDelete,
}: {
  cupom: Cupom;
  desc: string;
  onToggle?: () => void;
  onDelete?: () => void;
}) {
  const ativo = cupom.ativo !== false;
  const dinamico = !!onToggle;

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border-2 px-4 py-3 transition-opacity ${
        ativo ? "border-rose-light" : "border-gray-200 opacity-50"
      }`}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-rose text-sm">
            {cupom.codigo}
          </span>
          <span className="rounded-full bg-rose-light px-2 py-0.5 text-xs font-semibold text-cacau">
            {desc}
          </span>
          {!ativo && (
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
              inativo
            </span>
          )}
          {cupom.expira && (
            <span className="text-xs text-cacau-soft">
              até {cupom.expira.split("-").reverse().join("/")}
            </span>
          )}
          {cupom.minimo && (
            <span className="text-xs text-cacau-soft">
              mín. R${cupom.minimo}
            </span>
          )}
        </div>
        <p className="text-xs text-cacau-soft mt-0.5 truncate">
          {cupom.descricao}
        </p>
      </div>

      {/* Ações (somente cupons dinâmicos) */}
      {dinamico && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggle}
            className={`rounded-full border-2 px-3 py-1 text-xs font-semibold transition-colors ${
              ativo
                ? "border-rose text-rose hover:bg-rose hover:text-white"
                : "border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white"
            }`}
          >
            {ativo ? "Desativar" : "Ativar"}
          </button>
          <button
            onClick={onDelete}
            className="rounded-full border-2 border-gray-300 px-3 py-1 text-xs font-semibold text-gray-500 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
          >
            Apagar
          </button>
        </div>
      )}
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "numeric";
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-cacau-soft block mb-1">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        required={required}
        className="w-full rounded-xl border-2 border-rose-light bg-white px-4 py-3 text-sm outline-none focus:border-rose"
      />
    </label>
  );
}

function CampoData({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-cacau-soft block mb-1">
        {label}
      </span>
      <input
        type="date"
        lang="pt-BR"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={new Date().toISOString().slice(0, 10)}
        className="w-full rounded-xl border-2 border-rose-light bg-white px-4 py-3 text-sm outline-none focus:border-rose [color-scheme:light]"
      />
    </label>
  );
}
