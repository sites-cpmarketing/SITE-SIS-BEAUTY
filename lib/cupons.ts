/**
 * Cupons de desconto. Edite a lista abaixo para criar/remover cupons.
 * A validação acontece também no servidor (api/checkout), então o preço
 * final nunca depende do que vem do navegador.
 */

export type Cupom = {
  codigo: string;
  tipo: "percentual" | "fixo";
  valor: number; // % (1-100) se percentual, ou R$ se fixo
  descricao: string;
};

export const CUPONS: Cupom[] = [
  {
    codigo: "BEMVINDA10",
    tipo: "percentual",
    valor: 10,
    descricao: "10% de desconto de boas-vindas",
  },
];

/** Procura um cupom pelo código (case-insensitive). */
export function buscarCupom(codigo: string | undefined | null): Cupom | null {
  const c = String(codigo ?? "").trim().toUpperCase();
  if (!c) return null;
  return CUPONS.find((x) => x.codigo === c) ?? null;
}

/** Aplica o desconto do cupom a um total, sem deixar negativo. */
export function aplicarCupom(total: number, cupom: Cupom | null): number {
  if (!cupom) return total;
  const desconto =
    cupom.tipo === "percentual" ? (total * cupom.valor) / 100 : cupom.valor;
  return Math.max(0, Math.round((total - desconto) * 100) / 100);
}
