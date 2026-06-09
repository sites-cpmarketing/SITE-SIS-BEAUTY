/**
 * ============================================================
 *  Idempotência distribuída — trava atômica via Vercel KV (Redis)
 * ============================================================
 *  Usado no servidor (webhooks) para garantir que um evento seja
 *  processado UMA ÚNICA VEZ, mesmo quando o provedor (ex.: Mercado
 *  Pago) reenvia a notificação várias vezes e as chamadas caem em
 *  instâncias serverless diferentes.
 *
 *  O `SET NX` do Redis é atômico: entre várias chamadas concorrentes,
 *  só a primeira cria a chave e recebe "OK"; as demais recebem null.
 *  Diferente de um Map em memória, isso funciona entre instâncias.
 * ============================================================
 */

function getRedis() {
  // Vercel conecta o Upstash Redis com as variáveis KV_REST_API_*
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const { Redis } = require("@upstash/redis") as typeof import("@upstash/redis");
  return new Redis({ url, token });
}

/**
 * Reserva o processamento de uma chave de forma ATÔMICA e cross-instância.
 *
 * @returns `true`  → reservou agora (primeira vez): DEVE processar.
 *          `false` → já estava reservado: é duplicado, deve PULAR.
 *
 * Se o Redis não estiver configurado, retorna `true` (não há como coordenar
 * entre instâncias — o chamador deve manter o fallback em memória).
 */
export async function reservarProcessamento(
  chave: string,
  ttlSegundos = 4 * 60 * 60 // 4 horas
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true;
  try {
    const res = await redis.set(`processado:${chave}`, Date.now(), {
      nx: true,
      ex: ttlSegundos,
    });
    // "OK" = chave criada agora (reservou). null = já existia (duplicado).
    return res === "OK";
  } catch {
    // Falha no Redis não pode travar o pedido — segue o fluxo.
    return true;
  }
}
