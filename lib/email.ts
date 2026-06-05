/**
 * Envio de e-mails transacionais via Resend (https://resend.com).
 * Serve como registro do pedido (e-mail p/ a loja) e confirmação (cliente).
 *
 * Configure no .env:
 *   RESEND_API_KEY  → chave da API Resend (sem ela, as funções não fazem nada)
 *   EMAIL_FROM      → remetente verificado (ex.: "SIS Beauty <pedidos@seudominio>")
 *   LOJA_EMAIL      → e-mail que recebe o aviso de novo pedido
 */

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "SIS Beauty <onboarding@resend.dev>";
const LOJA_EMAIL = process.env.LOJA_EMAIL || "contato@sisbeauty.com.br";

async function enviar(to: string, subject: string, html: string) {
  if (!RESEND_KEY || !to) return; // sem chave/destinatário → no-op
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!r.ok) console.error("[email] falha ao enviar:", await r.text());
  } catch (e) {
    console.error("[email] erro:", e);
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
