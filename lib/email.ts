/**
 * Envio de e-mails transacionais via SMTP (Hostinger ou qualquer provedor).
 * Serve como registro do pedido (e-mail p/ a loja) e confirmação ao cliente.
 *
 * Configure no .env:
 *   SMTP_HOST     → ex.: smtp.hostinger.com
 *   SMTP_PORT     → ex.: 465 (SSL) ou 587 (TLS/STARTTLS)
 *   SMTP_SECURE   → "true" para SSL (porta 465), "false" para STARTTLS (587)
 *   SMTP_USER     → e-mail completo (ex.: pedidos@sisbeauty.com.br)
 *   SMTP_PASS     → senha do e-mail
 *   EMAIL_FROM    → remetente (ex.: "SIS Beauty <pedidos@sisbeauty.com.br>")
 *   LOJA_EMAIL    → e-mail que recebe o aviso de novo pedido
 */

import nodemailer from "nodemailer";

function criarTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE !== "false"; // padrão: true (SSL)

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

const FROM = process.env.EMAIL_FROM || `SIS Beauty <${process.env.SMTP_USER}>`;
const LOJA_EMAIL = process.env.LOJA_EMAIL || "contato@sisbeauty.com.br";

async function enviar(to: string, subject: string, html: string) {
  if (!to) return;

  const transporter = criarTransporter();
  if (!transporter) {
    // SMTP não configurado → loga e segue sem erros
    console.warn("[email] SMTP não configurado (SMTP_HOST/SMTP_USER/SMTP_PASS ausentes).");
    return;
  }

  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    console.log("[email] enviado:", info.messageId);
  } catch (e) {
    console.error("[email] erro ao enviar:", e);
  }
}

export type DadosPedido = {
  ref?: string;
  nome: string;
  emailCliente?: string;
  descricao: string;
  total: string;
  endereco: string;
  telefone?: string;
  cpf?: string;
};

export type DadosRastreio = {
  nome: string;
  emailCliente: string;
  codigo: string;        // ex.: "AA123456789BR"
  servico?: string;      // ex.: "PAC", "SEDEX"
  descricao?: string;
};

/** Envia o código de rastreio ao cliente após a etiqueta ser gerada. */
export async function enviarRastreio(d: DadosRastreio) {
  if (!d.emailCliente || !d.codigo) return;

  const linkCorreios = `https://rastreamento.correios.com.br/app/index.php?label=${d.codigo}`;
  const linkME = `https://melhorrastreio.com.br/rastreio/${d.codigo}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#43302a">
      <h2 style="color:#c16b56">Seu pedido foi enviado! 📦</h2>
      <p>Olá, ${d.nome || "cliente"}! O seu ${d.descricao || "pedido SIS Beauty"} foi postado e está a caminho.</p>
      <p>
        <strong>Serviço:</strong> ${d.servico || "Correios"}<br/>
        <strong>Código de rastreio:</strong> <span style="font-size:18px;font-weight:bold;letter-spacing:2px">${d.codigo}</span>
      </p>
      <p style="margin:24px 0">
        <a href="${linkCorreios}"
           style="background:#c16b56;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          Rastrear pelo site dos Correios →
        </a>
      </p>
      <p>Ou acesse: <a href="${linkME}">${linkME}</a></p>
      <p style="color:#6b4f46;font-size:12px;margin-top:32px">
        SIS Beauty · suplemento alimentar. Em caso de dúvidas, fale conosco pelo WhatsApp.
      </p>
    </div>`;

  await enviar(d.emailCliente, `Seu pedido foi enviado! Rastreie aqui 📦`, html);
}

/** Envia confirmação ao cliente e o registro do pedido para a loja. */
export async function enviarEmailsPedido(d: DadosPedido) {
  const cliente = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#43302a">
      <h2 style="color:#c16b56">Pedido confirmado 💜</h2>
      <p>Olá, ${d.nome || "cliente"}! Recebemos o seu pedido e já estamos preparando tudo com carinho.</p>
      <p><strong>Itens:</strong> ${d.descricao}<br/>
         <strong>Total:</strong> ${d.total} · frete grátis</p>
      <p><strong>Entrega em:</strong><br/>${d.endereco}</p>
      <p>Você receberá o código de rastreio assim que o envio for postado.</p>
      <p style="color:#6b4f46;font-size:12px">SIS Beauty · suplemento alimentar. Resultados podem variar.</p>
    </div>`;

  const loja = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#43302a">
      <h2>🛒 Novo pedido ${d.ref ?? ""}</h2>
      <p><strong>Cliente:</strong> ${d.nome}<br/>
         <strong>CPF:</strong> ${d.cpf ?? "-"}<br/>
         <strong>Telefone:</strong> ${d.telefone ?? "-"}<br/>
         <strong>E-mail:</strong> ${d.emailCliente ?? "-"}</p>
      <p><strong>Itens:</strong> ${d.descricao}<br/>
         <strong>Total:</strong> ${d.total}</p>
      <p><strong>Endereço:</strong><br/>${d.endereco}</p>
    </div>`;

  if (d.emailCliente) {
    await enviar(d.emailCliente, "Seu pedido SIS Beauty foi confirmado 💜", cliente);
  }
  await enviar(LOJA_EMAIL, `Novo pedido ${d.ref ?? ""} — ${d.descricao}`, loja);
}
