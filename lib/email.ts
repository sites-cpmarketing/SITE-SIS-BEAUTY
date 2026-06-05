/**
 * Envio de e-mails transacionais via SMTP (Hostinger ou qualquer provedor).
 *
 * Configure no .env:
 *   SMTP_HOST / SMTP_PORT / SMTP_SECURE / SMTP_USER / SMTP_PASS
 *   EMAIL_FROM   → remetente (ex.: "SIS Beauty <pedidos@sisbeauty.com.br>")
 *   LOJA_EMAIL   → e-mail que recebe o aviso de novo pedido
 */

import nodemailer from "nodemailer";

// ── Transport ────────────────────────────────────────────────────────────────

function criarTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE !== "false";
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

const FROM      = process.env.EMAIL_FROM   || `SIS Beauty <${process.env.SMTP_USER}>`;
const LOJA_EMAIL = process.env.LOJA_EMAIL  || "contato@sisbeauty.com.br";
const WA_LINK   = "https://wa.me/5562994528264";
const INSTAGRAM = "https://instagram.com/sisbeauty";

async function enviar(to: string, subject: string, html: string) {
  if (!to) return;
  const transporter = criarTransporter();
  if (!transporter) {
    console.warn("[email] SMTP não configurado (SMTP_HOST/USER/PASS ausentes).");
    return;
  }
  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    console.log("[email] enviado:", info.messageId);
  } catch (e) {
    console.error("[email] erro ao enviar:", e);
  }
}

// ── Blocos reutilizáveis ─────────────────────────────────────────────────────

const CORES = {
  primaria:   "#c16b56",
  escura:     "#43302a",
  media:      "#7a5c54",
  fundo:      "#fdf8f6",
  card:       "#ffffff",
  borda:      "#f0e4df",
  destaque:   "#fef3ef",
  texto:      "#43302a",
  subtexto:   "#7a5c54",
};

function cabecalho(titulo: string, subtitulo?: string) {
  return `
  <tr>
    <td style="background:linear-gradient(135deg,#43302a 0%,#6b3d2e 100%);padding:40px 40px 32px;text-align:center">
      <div style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fdf8f6;letter-spacing:3px;text-transform:uppercase">
        SIS Beauty
      </div>
      <div style="font-family:Georgia,serif;font-size:12px;color:#e8c5ba;letter-spacing:4px;text-transform:uppercase;margin-top:4px">
        Hair Growth
      </div>
      <div style="width:48px;height:2px;background:#c16b56;margin:20px auto 0"></div>
      <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;margin-top:20px">
        ${titulo}
      </div>
      ${subtitulo ? `<div style="font-family:Arial,sans-serif;font-size:14px;color:#e8c5ba;margin-top:8px">${subtitulo}</div>` : ""}
    </td>
  </tr>`;
}

function rodape() {
  return `
  <tr>
    <td style="background:#43302a;padding:28px 40px;text-align:center">
      <div style="margin-bottom:16px">
        <a href="${WA_LINK}"
           style="display:inline-block;background:#25d366;color:#fff;font-family:Arial,sans-serif;font-size:13px;font-weight:700;padding:10px 20px;border-radius:24px;text-decoration:none;margin:0 6px">
          💬 WhatsApp
        </a>
        <a href="${INSTAGRAM}"
           style="display:inline-block;background:#e1306c;color:#fff;font-family:Arial,sans-serif;font-size:13px;font-weight:700;padding:10px 20px;border-radius:24px;text-decoration:none;margin:0 6px">
          📸 Instagram
        </a>
      </div>
      <div style="font-family:Arial,sans-serif;font-size:12px;color:#a07060;line-height:1.6">
        SIS Beauty · suplemento alimentar · resultados podem variar individualmente<br/>
        Av. A, Qd. 32, Lt. 09 — Vila Lucy, Goiânia/GO
      </div>
    </td>
  </tr>`;
}

function layout(conteudo: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SIS Beauty</title></head>
<body style="margin:0;padding:0;background:${CORES.fundo};font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${CORES.fundo};padding:32px 16px">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(67,48,42,.12)">
          ${conteudo}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Templates ────────────────────────────────────────────────────────────────

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
  codigo: string;
  servico?: string;
  descricao?: string;
};

export function htmlConfirmacaoCliente(d: DadosPedido) {
  const primeiroNome = (d.nome || "cliente").split(" ")[0];
  return layout(`
    ${cabecalho("Pedido confirmado! 🎉", "Obrigada pela sua compra")}
    <tr>
      <td style="background:${CORES.card};padding:40px">

        <p style="margin:0 0 24px;font-size:16px;color:${CORES.texto};line-height:1.6">
          Olá, <strong>${primeiroNome}</strong>! 💜<br/>
          Recebemos seu pedido e já estamos preparando tudo com muito carinho.
        </p>

        <!-- Resumo do pedido -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${CORES.destaque};border-radius:12px;overflow:hidden;margin-bottom:24px">
          <tr>
            <td style="padding:8px 20px;background:${CORES.primaria}">
              <span style="font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;text-transform:uppercase">Resumo do pedido</span>
            </td>
          </tr>
          <tr>
            <td style="padding:20px">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:14px;color:${CORES.subtexto};padding-bottom:8px">Produto</td>
                  <td style="font-size:14px;color:${CORES.texto};font-weight:600;padding-bottom:8px;text-align:right">${d.descricao}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:${CORES.subtexto};padding-bottom:8px">Frete</td>
                  <td style="font-size:14px;color:#2d7a4f;font-weight:700;padding-bottom:8px;text-align:right">Grátis ✓</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-top:1px solid ${CORES.borda};padding-top:12px"></td>
                </tr>
                <tr>
                  <td style="font-size:16px;color:${CORES.texto};font-weight:700">Total</td>
                  <td style="font-size:20px;color:${CORES.primaria};font-weight:700;text-align:right">${d.total}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Endereço -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${CORES.borda};border-radius:12px;margin-bottom:28px">
          <tr>
            <td style="padding:16px 20px">
              <div style="font-size:12px;font-weight:700;color:${CORES.subtexto};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">📦 Endereço de entrega</div>
              <div style="font-size:14px;color:${CORES.texto};line-height:1.8">${d.endereco}</div>
            </td>
          </tr>
        </table>

        <!-- Próximo passo -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf4;border-left:4px solid #2d7a4f;border-radius:0 8px 8px 0;margin-bottom:28px">
          <tr>
            <td style="padding:16px 20px;font-size:14px;color:#1a5c35;line-height:1.6">
              📬 <strong>O que acontece agora?</strong><br/>
              Assim que postado, você receberá um e-mail com o <strong>código de rastreio</strong> para acompanhar a entrega.
            </td>
          </tr>
        </table>

        <!-- CTA Dúvidas -->
        <div style="text-align:center">
          <a href="${WA_LINK}"
             style="display:inline-block;background:${CORES.primaria};color:#fff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:32px;text-decoration:none;letter-spacing:.5px">
            Falar com a gente no WhatsApp
          </a>
        </div>

      </td>
    </tr>
    ${rodape()}
  `);
}

export function htmlRegistroLoja(d: DadosPedido) {
  return layout(`
    ${cabecalho("🛒 Novo pedido recebido", d.ref ? `Referência: ${d.ref}` : undefined)}
    <tr>
      <td style="background:${CORES.card};padding:40px">

        <!-- Badge -->
        <div style="display:inline-block;background:#e8f5e9;color:#2d7a4f;font-size:12px;font-weight:700;padding:6px 14px;border-radius:24px;margin-bottom:24px;letter-spacing:.5px">
          ✅ PAGAMENTO APROVADO
        </div>

        <!-- Dados do cliente -->
        <div style="font-size:13px;font-weight:700;color:${CORES.subtexto};letter-spacing:1px;text-transform:uppercase;margin-bottom:12px">Cliente</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${CORES.borda};border-radius:12px;margin-bottom:24px;overflow:hidden">
          ${[
            ["Nome", d.nome],
            ["CPF", d.cpf ?? "-"],
            ["Telefone", d.telefone ?? "-"],
            ["E-mail", d.emailCliente ?? "-"],
          ].map(([label, val], i) => `
          <tr style="background:${i % 2 === 0 ? CORES.card : CORES.fundo}">
            <td style="padding:12px 16px;font-size:13px;color:${CORES.subtexto};width:110px;font-weight:600">${label}</td>
            <td style="padding:12px 16px;font-size:14px;color:${CORES.texto};font-weight:500">${val}</td>
          </tr>`).join("")}
        </table>

        <!-- Pedido -->
        <div style="font-size:13px;font-weight:700;color:${CORES.subtexto};letter-spacing:1px;text-transform:uppercase;margin-bottom:12px">Pedido</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${CORES.destaque};border-radius:12px;margin-bottom:24px">
          <tr>
            <td style="padding:20px">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:14px;color:${CORES.subtexto};padding-bottom:8px">Itens</td>
                  <td style="font-size:14px;color:${CORES.texto};font-weight:600;padding-bottom:8px;text-align:right">${d.descricao}</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-top:1px solid ${CORES.borda};padding-top:12px"></td>
                </tr>
                <tr>
                  <td style="font-size:15px;color:${CORES.texto};font-weight:700">Total recebido</td>
                  <td style="font-size:20px;color:${CORES.primaria};font-weight:700;text-align:right">${d.total}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Endereço -->
        <div style="font-size:13px;font-weight:700;color:${CORES.subtexto};letter-spacing:1px;text-transform:uppercase;margin-bottom:12px">Endereço de entrega</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${CORES.borda};border-radius:12px;margin-bottom:28px">
          <tr>
            <td style="padding:16px 20px;font-size:14px;color:${CORES.texto};line-height:1.8">
              📍 ${d.endereco}
            </td>
          </tr>
        </table>

        <!-- Ação -->
        <div style="text-align:center">
          <a href="https://app.melhorenvio.com.br/envios/geradas"
             style="display:inline-block;background:${CORES.escura};color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:32px;text-decoration:none">
            Abrir Melhor Envio → Gerar etiqueta
          </a>
        </div>

      </td>
    </tr>
    ${rodape()}
  `);
}

export function htmlRastreioCliente(d: DadosRastreio) {
  const primeiroNome = (d.nome || "cliente").split(" ")[0];
  const linkCorreios = `https://rastreamento.correios.com.br/app/index.php?label=${d.codigo}`;
  const linkME      = `https://melhorrastreio.com.br/rastreio/${d.codigo}`;

  return layout(`
    ${cabecalho("Seu pedido saiu! 📦", "Está a caminho da sua casa")}
    <tr>
      <td style="background:${CORES.card};padding:40px">

        <p style="margin:0 0 28px;font-size:16px;color:${CORES.texto};line-height:1.6">
          Boa notícia, <strong>${primeiroNome}</strong>! 🎉<br/>
          Seu <strong>${d.descricao || "pedido SIS Beauty"}</strong> foi postado pelos Correios e já está em trânsito.
        </p>

        <!-- Código de rastreio em destaque -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fef3ef,#fde8e0);border:2px solid ${CORES.primaria};border-radius:16px;margin-bottom:28px">
          <tr>
            <td style="padding:28px;text-align:center">
              <div style="font-size:12px;font-weight:700;color:${CORES.primaria};letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">
                Código de rastreio
              </div>
              <div style="font-size:28px;font-weight:700;color:${CORES.escura};letter-spacing:6px;font-family:monospace;background:#fff;display:inline-block;padding:12px 24px;border-radius:8px;border:1px solid ${CORES.borda}">
                ${d.codigo}
              </div>
              <div style="font-size:13px;color:${CORES.subtexto};margin-top:12px">
                Serviço: <strong>${d.servico || "Correios"}</strong>
              </div>
            </td>
          </tr>
        </table>

        <!-- Botão principal -->
        <div style="text-align:center;margin-bottom:20px">
          <a href="${linkCorreios}"
             style="display:inline-block;background:${CORES.primaria};color:#fff;font-size:16px;font-weight:700;padding:16px 36px;border-radius:32px;text-decoration:none;letter-spacing:.5px">
            📍 Rastrear pelos Correios
          </a>
        </div>

        <!-- Link alternativo -->
        <div style="text-align:center;margin-bottom:32px">
          <a href="${linkME}" style="font-size:13px;color:${CORES.primaria};text-decoration:underline">
            Ou rastreie pelo Melhor Rastreio
          </a>
        </div>

        <!-- Dica -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${CORES.fundo};border-radius:12px">
          <tr>
            <td style="padding:18px 20px;font-size:13px;color:${CORES.subtexto};line-height:1.7;text-align:center">
              💡 O rastreio pode levar até <strong>24h</strong> para aparecer no site dos Correios após a postagem.<br/>
              Dúvidas? Fale com a gente no
              <a href="${WA_LINK}" style="color:${CORES.primaria};font-weight:700;text-decoration:none">WhatsApp</a>.
            </td>
          </tr>
        </table>

      </td>
    </tr>
    ${rodape()}
  `);
}

// ── Funções públicas ─────────────────────────────────────────────────────────

/** Envia confirmação ao cliente + registro do pedido para a loja. */
export async function enviarEmailsPedido(d: DadosPedido) {
  if (d.emailCliente) {
    await enviar(
      d.emailCliente,
      "Seu pedido SIS Beauty foi confirmado! 🎉",
      htmlConfirmacaoCliente(d),
    );
  }
  await enviar(
    LOJA_EMAIL,
    `🛒 Novo pedido ${d.ref ?? ""} — ${d.descricao}`,
    htmlRegistroLoja(d),
  );
}

/** Envia o código de rastreio ao cliente após a etiqueta ser gerada. */
export async function enviarRastreio(d: DadosRastreio) {
  if (!d.emailCliente || !d.codigo) return;
  await enviar(
    d.emailCliente,
    `📦 Seu pedido foi enviado! Rastreie aqui → ${d.codigo}`,
    htmlRastreioCliente(d),
  );
}
