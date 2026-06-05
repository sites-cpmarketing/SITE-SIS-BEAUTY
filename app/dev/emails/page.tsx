/**
 * Preview dos e-mails transacionais — só disponível em desenvolvimento.
 * Acesse: http://localhost:3000/dev/emails
 */

import { notFound } from "next/navigation";
import {
  htmlConfirmacaoCliente,
  htmlRegistroLoja,
  htmlRastreioCliente,
} from "@/lib/email";

// ── Dados de exemplo ──────────────────────────────────────────────────────────

const EX = {
  ref:          "SIS-20260605-001",
  nome:         "Maria Silva",
  emailCliente: "maria@exemplo.com",
  cpf:          "529.982.247-25",
  telefone:     "(62) 9 9999-9999",
  descricao:    "Completo 3 meses (2× Goma + 1× Cápsula)",
  total:        "R$ 225,00",
  endereco:     "Rua das Flores, 123 - Apt 45<br/>Jardim Primavera — Goiânia/GO<br/>CEP 74000-000",
  codigo:       "AA123456789BR",
  servico:      "PAC",
};

const EMAILS = [
  {
    titulo:  "1. Confirmação de pedido → Cliente",
    assunto: "Seu pedido SIS Beauty foi confirmado! 🎉",
    para:    EX.emailCliente,
    html:    htmlConfirmacaoCliente(EX),
  },
  {
    titulo:  "2. Registro do pedido → Loja",
    assunto: `🛒 Novo pedido ${EX.ref} — ${EX.descricao}`,
    para:    "contato@sisbeauty.com.br",
    html:    htmlRegistroLoja(EX),
  },
  {
    titulo:  "3. Código de rastreio → Cliente",
    assunto: `📦 Seu pedido foi enviado! Rastreie aqui → ${EX.codigo}`,
    para:    EX.emailCliente,
    html:    htmlRastreioCliente({ nome: EX.nome, emailCliente: EX.emailCliente, codigo: EX.codigo, servico: EX.servico, descricao: EX.descricao }),
  },
];

// ── Página ────────────────────────────────────────────────────────────────────

export default function DevEmailsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: "#f0ebe8", minHeight: "100vh", padding: "40px 16px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 24, margin: "0 0 6px", color: "#43302a", fontWeight: 700 }}>
            📬 Preview de E-mails
          </h1>
          <p style={{ margin: 0, color: "#7a5c54", fontSize: 14 }}>
            Página visível apenas em{" "}
            <code style={{ background: "#e8ddd9", padding: "2px 7px", borderRadius: 4, fontSize: 12 }}>
              NODE_ENV=development
            </code>
            {" "}— em produção retorna 404.
          </p>
        </div>

        {EMAILS.map((email, i) => (
          <div key={i} style={{ marginBottom: 48 }}>
            {/* Cabeçalho do card */}
            <div style={{
              background: "#43302a",
              borderRadius: "12px 12px 0 0",
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#fdf8f6" }}>{email.titulo}</span>
              <span style={{ fontSize: 12, color: "#a07060" }}>
                <strong style={{ color: "#c8a090" }}>Para:</strong> {email.para}
              </span>
              <span style={{ fontSize: 12, color: "#a07060" }}>
                <strong style={{ color: "#c8a090" }}>Assunto:</strong> {email.assunto}
              </span>
            </div>

            {/* Preview do e-mail */}
            <div style={{
              border: "1px solid #ddd",
              borderTop: "none",
              borderRadius: "0 0 12px 12px",
              overflow: "hidden",
              background: "#fff",
            }}>
              <iframe
                srcDoc={email.html}
                style={{ width: "100%", border: "none", display: "block", height: 580 }}
                title={email.titulo}
              />
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
