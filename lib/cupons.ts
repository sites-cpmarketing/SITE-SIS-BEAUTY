/**
 * ============================================================
 *  CUPONS DE DESCONTO — SIS Beauty
 * ============================================================
 *
 * COMO CRIAR UM CUPOM:
 *
 *  1. Adicione um objeto na lista CUPONS abaixo.
 *  2. Campos obrigatórios: codigo, tipo, valor, descricao
 *  3. Campos opcionais:   ativo, expira, minimo
 *
 *  Exemplos:
 *
 *  // 10% de desconto sem restrição:
 *  { codigo: "PROMO10", tipo: "percentual", valor: 10, descricao: "10% off" }
 *
 *  // R$ 30 de desconto em pedidos acima de R$ 200:
 *  { codigo: "VOLTA30", tipo: "fixo", valor: 30, minimo: 200, descricao: "R$30 off acima de R$200" }
 *
 *  // 15% só até 31/12/2026:
 *  { codigo: "FIM2026", tipo: "percentual", valor: 15, expira: "2026-12-31", descricao: "15% até 31/12" }
 *
 *  // Cupom desativado temporariamente (sem apagar):
 *  { codigo: "ANTIGO", tipo: "percentual", valor: 5, ativo: false, descricao: "Inativo" }
 *
 * ⚠️  A validação roda TAMBÉM no servidor (/api/checkout).
 *     O cliente nunca consegue forçar um desconto inválido.
 * ============================================================
 */

export type Cupom = {
  /** Código que o cliente digita — sempre em MAIÚSCULAS */
  codigo: string;
  /** "percentual" = desconto em % | "fixo" = desconto em R$ */
  tipo: "percentual" | "fixo";
  /** Percentual (1–100) ou valor em reais */
  valor: number;
  /** Texto exibido ao cliente ao aplicar */
  descricao: string;
  /** false = cupom desativado mas não apagado (padrão: true) */
  ativo?: boolean;
  /** Data de expiração no formato "YYYY-MM-DD" */
  expira?: string;
  /** Valor mínimo do pedido para o cupom ser válido (em R$) */
  minimo?: number;
};

// ============================================================
//  👇 EDITE AQUI — adicione, remova ou desative seus cupons
// ============================================================
export const CUPONS: Cupom[] = [
  {
    codigo: "CLARISSY10",
    tipo: "percentual",
    valor: 10,
    descricao: "10% off — promoção de lançamento",
  },
    {
    codigo: "DREZACUNHA10",
    tipo: "percentual",
    valor: 10,
    descricao: "10% off — promoção de lançamento",
  },
    {
    codigo: "JANINE10",
    tipo: "percentual",
    valor: 10,
    descricao: "10% off — promoção de lançamento",
  },
      {
    codigo: "NEURY10",
    tipo: "percentual",
    valor: 10,
    descricao: "10% off — promoção de lançamento",
  },
      {
    codigo: "SUZANA10",
    tipo: "percentual",
    valor: 10,
    descricao: "10% off — promoção de lançamento",
  },
    {
    codigo: "JULLIANE10",
    tipo: "percentual",
    valor: 10,
    descricao: "10% off — promoção de lançamento",
  },

];
// ============================================================

/** Motivo pelo qual um cupom foi rejeitado (para mensagem ao usuário) */
export type ErroCupom =
  | "nao_encontrado"
  | "inativo"
  | "expirado"
  | "valor_minimo";

export type ResultadoCupom =
  | { valido: true;  cupom: Cupom }
  | { valido: false; motivo: ErroCupom; cupom?: Cupom };

/**
 * Valida um cupom pelo código. Retorna o resultado com motivo de erro se inválido.
 */
export function validarCupom(
  codigo: string | undefined | null,
  totalPedido?: number
): ResultadoCupom {
  const c = String(codigo ?? "").trim().toUpperCase();
  if (!c) return { valido: false, motivo: "nao_encontrado" };

  const cupom = CUPONS.find((x) => x.codigo === c);
  if (!cupom) return { valido: false, motivo: "nao_encontrado" };

  if (cupom.ativo === false) return { valido: false, motivo: "inativo", cupom };

  if (cupom.expira) {
    const hoje = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    if (hoje > cupom.expira) return { valido: false, motivo: "expirado", cupom };
  }

  if (cupom.minimo !== undefined && totalPedido !== undefined) {
    if (totalPedido < cupom.minimo) {
      return { valido: false, motivo: "valor_minimo", cupom };
    }
  }

  return { valido: true, cupom };
}

/**
 * Compatibilidade com o código existente — retorna o cupom ou null.
 * Use `validarCupom` quando quiser a mensagem de erro detalhada.
 */
export function buscarCupom(
  codigo: string | undefined | null,
  totalPedido?: number
): Cupom | null {
  const r = validarCupom(codigo, totalPedido);
  return r.valido ? r.cupom : null;
}

/** Aplica o desconto do cupom a um total, sem deixar negativo. */
export function aplicarCupom(total: number, cupom: Cupom | null): number {
  if (!cupom) return total;
  const desconto =
    cupom.tipo === "percentual" ? (total * cupom.valor) / 100 : cupom.valor;
  return Math.max(0, Math.round((total - desconto) * 100) / 100);
}

/** Calcula o valor do desconto em R$ (útil para exibir na UI). */
export function valorDesconto(total: number, cupom: Cupom | null): number {
  if (!cupom) return 0;
  return total - aplicarCupom(total, cupom);
}

/** Mensagem de erro amigável para exibir ao cliente. */
export function mensagemErroCupom(
  motivo: ErroCupom,
  cupom?: Cupom,
  totalPedido?: number
): string {
  switch (motivo) {
    case "nao_encontrado":
      return "Cupom inválido ou inexistente.";
    case "inativo":
      return "Este cupom não está mais ativo.";
    case "expirado":
      return `Cupom expirado em ${cupom?.expira?.split("-").reverse().join("/")}.`;
    case "valor_minimo":
      return `Este cupom é válido para pedidos acima de R$ ${cupom?.minimo?.toFixed(2).replace(".", ",")}. Seu pedido é R$ ${totalPedido?.toFixed(2).replace(".", ",")}.`;
    default:
      return "Cupom inválido.";
  }
}
