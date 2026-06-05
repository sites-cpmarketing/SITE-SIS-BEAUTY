"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/tracking";

/** Dispara o evento de conversão (Purchase) ao abrir a página de obrigado. */
export default function TrackPurchase() {
  useEffect(() => {
    trackEvent("Purchase", { currency: "BRL" });
  }, []);
  return null;
}
