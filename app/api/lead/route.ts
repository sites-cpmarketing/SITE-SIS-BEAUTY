/**
 * Recebe dados do modal do WhatsApp e encaminha para o webhook configurado.
 * Configure LEAD_WEBHOOK_URL no .env para ativar (ex: Make, n8n, Zapier, etc.)
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, email, telefone, fonte } = body as {
      nome?: string;
      email?: string;
      telefone?: string;
      fonte?: string;
    };

    const webhookUrl = process.env.LEAD_WEBHOOK_URL;

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome:     nome     || "",
          email:    email    || "",
          telefone: telefone || "",
          fonte:    fonte    || "site",
          data:     new Date().toISOString(),
          origem:   "SIS Beauty",
        }),
      });
    } else {
      // Sem webhook configurado: apenas loga localmente
      console.log("[lead] novo lead (LEAD_WEBHOOK_URL não configurado):", { nome, email, telefone });
    }

    return Response.json({ ok: true });
  } catch (e) {
    // Não falha o fluxo — o usuário ainda vai para o WhatsApp
    console.error("[lead] erro ao enviar lead:", e);
    return Response.json({ ok: true });
  }
}
