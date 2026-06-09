/**
 * Disparo de eventos para Meta Pixel e Google Analytics (client-side).
 * No-op seguro se as ferramentas não estiverem carregadas.
 */
type Win = {
  fbq?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
};

export function trackEvent(
  nome: string,
  params?: Record<string, unknown>,
  eventID?: string
) {
  if (typeof window === "undefined") return;
  const w = window as unknown as Win;
  try {
    // eventID vai no 4º argumento (options) do fbq — é a chave de
    // deduplicação da Meta (Pixel x Pixel e Pixel x Conversions API).
    if (eventID) {
      w.fbq?.("track", nome, params ?? {}, { eventID });
    } else {
      w.fbq?.("track", nome, params ?? {});
    }
    w.gtag?.("event", nome, params ?? {});
  } catch {
    /* ignora — tracking nunca pode quebrar a página */
  }
}
