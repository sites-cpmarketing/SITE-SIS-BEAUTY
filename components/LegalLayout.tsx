import Link from "next/link";
import type { ReactNode } from "react";

/** Container padrão das páginas legais (privacidade, termos, trocas). */
export default function LegalLayout({
  titulo,
  atualizado,
  children,
}: {
  titulo: string;
  atualizado: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 md:py-20">
      <Link href="/" className="text-sm font-semibold text-rose hover:underline">
        ← Voltar para a loja
      </Link>
      <h1 className="mt-6 text-3xl md:text-4xl">{titulo}</h1>
      <p className="mt-2 text-sm text-cacau-soft">
        Última atualização: {atualizado}
      </p>
      <div
        className="mt-8 space-y-4 text-cacau-soft leading-relaxed
          [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-cacau
          [&_a]:text-rose [&_a]:underline
          [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5
          [&_strong]:text-cacau"
      >
        {children}
      </div>
    </main>
  );
}

/** Aviso de que o texto é um modelo e deve ser revisado juridicamente. */
export function AvisoModelo() {
  return (
    <p className="mt-10 rounded-xl border border-rose-light bg-cream px-4 py-3 text-xs text-cacau-soft">
      Este documento é um modelo inicial. Recomendamos revisão por um advogado
      para adequação completa ao seu negócio.
    </p>
  );
}
