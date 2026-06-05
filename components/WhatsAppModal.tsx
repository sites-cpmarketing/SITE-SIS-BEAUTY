"use client";

import { useState } from "react";

/**
 * Botão flutuante do WhatsApp com modal de captura de lead.
 * Antes de redirecionar, coleta nome + e-mail + telefone e
 * envia via POST /api/lead (que encaminha para LEAD_WEBHOOK_URL).
 */

const WA_NUMBER = "5562994528264";
const WA_TEXT   = encodeURIComponent("Olá! Vim pelo site da SIS Beauty e gostaria de mais informações.");

function waLink() {
  return `https://wa.me/${WA_NUMBER}?text=${WA_TEXT}`;
}

type Campo = { nome: string; email: string; telefone: string };
type Status = "idle" | "enviando" | "ok" | "erro";

export default function WhatsAppModal() {
  const [aberto, setAberto]   = useState(false);
  const [campos, setCampos]   = useState<Campo>({ nome: "", email: "", telefone: "" });
  const [status, setStatus]   = useState<Status>("idle");

  function atualizar(k: keyof Campo) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setCampos((prev) => ({ ...prev, [k]: e.target.value }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setStatus("enviando");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...campos, fonte: "whatsapp-modal" }),
      });
    } catch {
      // Mesmo com erro no webhook, redireciona para o WA
    }
    setStatus("ok");
    // Pequena pausa para o usuário ver o feedback antes de redirecionar
    setTimeout(() => {
      window.open(waLink(), "_blank", "noopener,noreferrer");
      setAberto(false);
      setStatus("idle");
      setCampos({ nome: "", email: "", telefone: "" });
    }, 800);
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(true)}
        aria-label="Fale conosco no WhatsApp"
        className="fixed bottom-28 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_30px_-6px_rgba(18,140,114,0.75)] ring-1 ring-white/40 transition-transform duration-200 hover:scale-110 md:bottom-6 md:right-6"
        style={{ background: "linear-gradient(145deg,#25D366 0%,#0e8a72 100%)" }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
          <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15h-.004a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
        </svg>
      </button>

      {/* Overlay + Modal */}
      {aberto && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-end p-4 md:items-center md:justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={(e) => e.target === e.currentTarget && setAberto(false)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-[slideUp_0.25s_ease]">

            {/* Cabeçalho verde */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ background: "linear-gradient(135deg,#25D366 0%,#0e8a72 100%)" }}
            >
              <svg viewBox="0 0 24 24" fill="white" className="h-7 w-7 shrink-0" aria-hidden="true">
                <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15h-.004a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
              </svg>
              <div>
                <p className="font-bold text-white text-sm leading-tight">SIS Beauty</p>
                <p className="text-green-100 text-xs">Normalmente responde em minutos</p>
              </div>
              <button
                onClick={() => setAberto(false)}
                className="ml-auto text-white/80 hover:text-white text-xl leading-none"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {/* Corpo */}
            <div className="px-5 py-5">
              {status === "ok" ? (
                <div className="py-6 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="font-semibold text-cacau">Obrigada!</p>
                  <p className="text-sm text-cacau-soft mt-1">Abrindo o WhatsApp…</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-cacau-soft mb-4">
                    Preencha rapidinho e vamos te atender pelo WhatsApp! 💬
                  </p>
                  <form onSubmit={enviar} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-cacau-soft uppercase tracking-wide">
                        Seu nome <span className="text-rose">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={campos.nome}
                        onChange={atualizar("nome")}
                        placeholder="Maria Silva"
                        className="mt-1 w-full rounded-xl border border-rose-light bg-perola px-4 py-2.5 text-sm text-cacau placeholder:text-cacau-soft/60 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-cacau-soft uppercase tracking-wide">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={campos.email}
                        onChange={atualizar("email")}
                        placeholder="maria@email.com"
                        className="mt-1 w-full rounded-xl border border-rose-light bg-perola px-4 py-2.5 text-sm text-cacau placeholder:text-cacau-soft/60 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-cacau-soft uppercase tracking-wide">
                        Telefone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={campos.telefone}
                        onChange={atualizar("telefone")}
                        placeholder="(62) 9 9999-9999"
                        className="mt-1 w-full rounded-xl border border-rose-light bg-perola px-4 py-2.5 text-sm text-cacau placeholder:text-cacau-soft/60 outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === "enviando"}
                      className="w-full rounded-full py-3 text-sm font-bold text-white transition-opacity disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg,#25D366 0%,#0e8a72 100%)" }}
                    >
                      {status === "enviando" ? "Aguarde…" : "Ir para o WhatsApp →"}
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
