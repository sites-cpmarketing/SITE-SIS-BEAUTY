"use client";

import { useEffect, useState } from "react";
import { OFERTAS, brl } from "@/lib/produtos";

/**
 * Barra de compra fixa no rodapé — só no mobile, aparece após rolar o hero.
 * Padrão de conversão: CTA sempre acessível enquanto o cliente navega.
 */
export default function StickyComprar() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > 700);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  const menorPreco = Math.min(...OFERTAS.map((o) => o.precoPor));

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 md:hidden transition-transform duration-300 ${
        visivel ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-t border-rose-light bg-perola/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(74,51,45,0.35)] backdrop-blur-md">
        <div className="leading-tight">
          <p className="text-[11px] text-cacau-soft">A partir de</p>
          <p className="text-lg font-bold text-rose">
            {brl(menorPreco)}{" "}
            <span className="text-[11px] font-normal text-cacau-soft">
              · frete grátis
            </span>
          </p>
        </div>
        <a
          href="#ofertas"
          className="btn-primary rounded-full px-6 py-3 text-sm font-bold"
        >
          Comprar agora
        </a>
      </div>
    </div>
  );
}
