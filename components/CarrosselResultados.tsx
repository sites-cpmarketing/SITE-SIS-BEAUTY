"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { IMG } from "@/lib/produtos";

type Slide = {
  img: string;
  texto: string;
  autor: string;
};

const SLIDES: Slide[] = [
  {
    img: IMG.resultado1,
    texto: "Falhas na entrada preenchidas em 3 meses e meio de uso.",
    autor: "Cliente SIS Beauty",
  },
  {
    img: IMG.resultado2,
    texto: "Cerca de 4 cm de crescimento em menos de 2 meses.",
    autor: "Cliente SIS Beauty",
  },
  {
    img: IMG.resultado3,
    texto:
      "Crescimento visível, fios mais fortes, saudáveis e muito mais volume em 4 meses e meio.",
    autor: "Cliente SIS Beauty",
  },
  {
    img: IMG.resultado4,
    texto:
      "“49 dias usando e meu cabelo mudou bastante! Menos queda e bem mais volume.”",
    autor: "Bia · cliente SIS Beauty · 49 dias de uso",
  },
];

const INTERVALO = 4500;

export default function CarrosselResultados() {
  const n = SLIDES.length;
  const [i, setI] = useState(0);
  const [erros, setErros] = useState<Set<number>>(new Set());
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef<number | null>(null);

  const marcarErro = (idx: number) =>
    setErros((prev) => {
      const s = new Set(prev);
      s.add(idx);
      return s;
    });

  const go = useCallback((idx: number) => setI((idx + n) % n), [n]);

  const iniciar = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setI((p) => (p + 1) % n), INTERVALO);
  }, [n]);

  const pausar = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  useEffect(() => {
    iniciar();
    return pausar;
  }, [iniciar, pausar]);

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
    pausar();
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 40) go(i - 1);
    else if (dx < -40) go(i + 1);
    touchX.current = null;
    iniciar();
  }

  return (
    <div className="relative mx-auto mt-10 w-full max-w-2xl">
      <div
        className="overflow-hidden rounded-3xl bg-perola shadow-soft"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={pausar}
        onMouseLeave={iniciar}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {SLIDES.map((s, idx) => (
            <div key={idx} className="w-full shrink-0">
              <div className="relative h-[80vw] max-h-[440px] w-full bg-gradient-to-br from-rose-light/35 via-cream to-perola">
                {erros.has(idx) ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
                    <span className="font-[var(--font-display)] text-6xl leading-none text-rose/60">
                      &ldquo;
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">
                      Resultado real de cliente
                    </span>
                  </div>
                ) : (
                  <Image
                    src={s.img}
                    alt={s.autor}
                    fill
                    sizes="(max-width: 768px) 100vw, 640px"
                    className="object-contain p-3"
                    onError={() => marcarErro(idx)}
                  />
                )}
              </div>
              <div className="px-5 py-6 text-center">
                <div className="text-lg text-champagne">★★★★★</div>
                <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-cacau md:text-lg">
                  {s.texto}
                </p>
                <p className="mt-3 text-sm font-semibold text-rose">{s.autor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setas (discretas, tocáveis no mobile) */}
      <button
        type="button"
        onClick={() => go(i - 1)}
        aria-label="Depoimento anterior"
        className="absolute -left-5 top-[40%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-perola/85 text-xl text-cacau shadow-soft backdrop-blur-sm transition-colors hover:bg-rose hover:text-white md:flex"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => go(i + 1)}
        aria-label="Próximo depoimento"
        className="absolute -right-5 top-[40%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-perola/85 text-xl text-cacau shadow-soft backdrop-blur-sm transition-colors hover:bg-rose hover:text-white md:flex"
      >
        ›
      </button>

      {/* Indicadores */}
      <div className="mt-5 flex justify-center gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => go(idx)}
            aria-label={`Ir ao depoimento ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              i === idx ? "w-7 bg-rose" : "w-2.5 bg-rose-light"
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-cacau-soft md:hidden">
        arraste para o lado para ver mais →
      </p>
    </div>
  );
}
