/**
 * Disparo de eventos para Meta Pixel e Google Analytics (client-side).
 * No-op seguro se as ferramentas não estiverem carregadas.
 */
type Win = {
  fbq?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
};

export function trackEvent(nome: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as Win;
  try {
    w.fbq?.("track", nome, params ?? {});
    w.gtag?.("event", nome, params ?? {});
  } catch {
    /* ignora — tracking nunca pode quebrar a página */
  }
}
