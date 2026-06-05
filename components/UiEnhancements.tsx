"use client";

import { useEffect } from "react";

/**
 * Melhorias de UI progressivas (sem quebrar no-JS):
 *  - Revela elementos [data-reveal] conforme entram na viewport.
 *  - Eleva o header (sombra) ao rolar a página.
 *
 * Robusto por redundância: usa IntersectionObserver (caminho principal) E um
 * fallback por evento de scroll — o que disparar primeiro revela o elemento.
 * Progressive enhancement: sem JS o <noscript> do layout mantém tudo visível;
 * com prefers-reduced-motion o CSS desativa as animações.
 */
export default function UiEnhancements() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    const header = document.querySelector<HTMLElement>("[data-header]");

    // Revela um elemento aplicando o escalonamento (stagger) só durante o
    // reveal; depois limpa o delay p/ não atrasar a transição de hover.
    const revelar = (el: HTMLElement) => {
      if (el.classList.contains("is-visible")) return;
      const d = Number(el.getAttribute("data-delay")) || 0;
      if (d) {
        el.style.transitionDelay = `${d * 0.07}s`;
        window.setTimeout(() => {
          el.style.transitionDelay = "";
        }, 1000 + d * 70);
      }
      el.classList.add("is-visible");
    };

    // 1) IntersectionObserver — caminho principal
    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries, obs) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              revelar(e.target as HTMLElement);
              obs.unobserve(e.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
      );
      els.forEach((el) => io!.observe(el));
    }

    // 2) Fallback por scroll — cobre ambientes onde o IO é adiado
    const aplicar = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (const el of els) {
        if (
          !el.classList.contains("is-visible") &&
          el.getBoundingClientRect().top < vh * 0.9
        ) {
          revelar(el);
          io?.unobserve(el);
        }
      }
      if (header) {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      }
    };

    aplicar(); // estado inicial (revela o que já está na tela)
    window.addEventListener("scroll", aplicar, { passive: true });
    window.addEventListener("resize", aplicar, { passive: true });

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", aplicar);
      window.removeEventListener("resize", aplicar);
    };
  }, []);

  return null;
}
