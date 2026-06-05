/**
 * Recebe dados de leads e encaminha para o webhook configurado.
 *
 * Duas origens:
 *  - fonte "whatsapp-modal"  → LEAD_WEBHOOK_URL
 *  - fonte "checkout"        → CHECKOUT_WEBHOOK_URL  (formulário completo)
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fonte } = body as { fonte?: string };

    // Escolhe o webhook correto pela fonte
    const webhookUrl =
      fonte === "checkout"
        ? process.env.CHECKOUT_WEBHOOK_URL
        : process.env.LEAD_WEBHOOK_URL;

    const payload = {
      ...body,
      fonte: fonte || "site",
      data: new Date().toISOString(),
      origem: "SIS Beauty",
    };

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      console.log(`[lead] (${fonte || "site"}) webhook não configurado:`, payload);
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error("[lead] erro:", e);
    return Response.json({ ok: true });
  }
}
