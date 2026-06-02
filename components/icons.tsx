import type { SVGProps } from "react";

/**
 * Ícones de linha fina (estilo premium/joalheria) para a SIS Beauty.
 * Herdam a cor via currentColor (use text-champagne, text-rose, etc.).
 */
function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

/* Crescimento (broto com duas folhas) */
export function IcoBroto(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <path d="M12 21V10" />
      <path d="M12 12c0-3 2.2-5.2 5.2-5.2C17.2 9.8 15 12 12 12Z" />
      <path d="M12 14c0-2.6-2-4.6-4.6-4.6C7.4 12 9.4 14 12 14Z" />
    </Svg>
  );
}

/* Força / raiz (escudo com selo) */
export function IcoEscudo(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <path d="M12 3l6.5 2.6v4.9c0 4-2.8 6.9-6.5 8.1-3.7-1.2-6.5-4.1-6.5-8.1V5.6L12 3Z" />
      <path d="M9.4 11.9l1.7 1.7 3.5-3.7" />
    </Svg>
  );
}

/* Folha (natureza / menos quebra) */
export function IcoFolha(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <path d="M5 19C5 11.3 11.3 5 19 5c0 7.7-6.3 14-14 14Z" />
      <path d="M5.5 18.5C9 14 12.5 11 17.5 9.5" />
    </Svg>
  );
}

/* Brilho (sparkle de 4 pontas) */
export function IcoBrilho(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <path d="M12 2.5l1.8 7.7 7.7 1.8-7.7 1.8L12 21.5l-1.8-7.7L2.5 12l7.7-1.8L12 2.5Z" />
    </Svg>
  );
}

/* Gema / diamante (luxo, unhas fortes) */
export function IcoGema(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <path d="M6 4h12l3 5-9 11L3 9z" />
      <path d="M3 9h18" />
      <path d="M9 4l-3 5 6 11 6-11-3-5" />
    </Svg>
  );
}

/* Cápsula (vitaminas) */
export function IcoCapsula(p: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...p}>
      <rect x="3" y="9" width="18" height="6" rx="3" />
      <path d="M12 9v6" />
    </Svg>
  );
}
