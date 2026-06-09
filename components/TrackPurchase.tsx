"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/tracking";

/**
 * Dispara o evento de conversão (Purchase) UMA ÚNICA VEZ por pedido real.
 *
 * Proteções contra compra falsa / duplicada:
 *  - `paymentId` (anexado pelo Mercado Pago na URL de retorno) é obrigatório:
 *    acesso direto a /obrigado, sem pagamento, não dispara nada.
 *  - Deduplicação no navegador via localStorage: F5 / revisita não redispara.
 *  - eventID = paymentId: a Meta deduplica eventos repetidos (e fica pronto
 *    para a Conversions API server-side no futuro).
 */
export default function TrackPurchase({
  paymentId,
  valor,
}: {
  paymentId: string;
  valor?: number;
}) {
  useEffect(() => {
    if (!paymentId) return; // sem id de pagamento → não dispara (evita falsa)

    const chave = `purchase_tracked:${paymentId}`;
    try {
      if (localStorage.getItem(chave)) return; // já disparado → não duplica
      localStorage.setItem(chave, String(Date.now()));
    } catch {
      /* localStorage indisponível (modo privado): segue, eventID ainda protege */
    }

    const params: Record<string, unknown> = { currency: "BRL" };
    if (valor && valor > 0) params.value = valor;

    trackEvent("Purchase", params, paymentId);
  }, [paymentId, valor]);

  return null;
}
