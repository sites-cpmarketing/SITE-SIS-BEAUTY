/**
 * ============================================================
 *  SIS BEAUTY — Catálogo, Ofertas e Configuração de Frete
 * ============================================================
 *  Este é o arquivo central de negócio. Ajuste aqui:
 *  - preços e combos
 *  - peso/dimensões dos potes (essencial p/ o Melhor Envio)
 *  - CEP de origem do envio (vem do .env)
 * ============================================================
 */

export type TipoProduto = "goma" | "capsula";

/** Imagens otimizadas (em /public/fotos). Mapa semântico -> arquivo. */
export const IMG = {
  // Mockups dos produtos (PNG sem fundo -> WebP com transparência)
  mockupCapsula: "/fotos/mockup-capsula.webp",
  mockupGoma: "/fotos/mockup-goma.webp",
  heroCabelo: "/fotos/hero-modelo.webp",
  heroProduto: "/fotos/dsc06160.webp",
  embaixadora: "/fotos/marca-boutique.webp",
  embaixadoraApresenta: "/fotos/dsc06141.webp",
  cabelo1: "/fotos/dsc06145.webp",
  cabelo2: "/fotos/dsc06146.webp",
  capsulaPotes: "/fotos/dsc06131.webp",
  capsulaClose: "/fotos/dsc06132.webp",
  capsulaWide: "/fotos/dsc06133.webp",
  capsulaModelo: "/fotos/dsc06157.webp",
  gomaLifestyle: "/fotos/dsc06150.webp",
  gomaConsumo: "/fotos/dsc06155.webp",
  gomaPerfil: "/fotos/dsc06149.webp",
  modeloPote1: "/fotos/dsc06159.webp",
  modeloPote2: "/fotos/dsc06138.webp",
  lifestyleCorpo: "/fotos/dsc06158.webp",
  // Prova social — antes e depois de clientes reais (ordem do carrossel)
  resultado1: "/fotos/resultado-1.webp",
  resultado2: "/fotos/resultado-2.webp",
  resultado3: "/fotos/resultado-3.webp",
  resultado4: "/fotos/resultado-4.webp",
} as const;

/** Dados físicos de UMA unidade (pote). AJUSTE conforme seu produto real. */
export const UNIDADE = {
  pesoKg: 0.18, // peso de 1 pote cheio (kg) — confirme na balança
  alturaCm: 11,
  larguraCm: 6,
  comprimentoCm: 6,
};

/** Embalagem de envio por faixa de quantidade (cm). AJUSTE se usar caixas diferentes. */
export function pacoteParaQuantidade(unidades: number) {
  // Caixa que comporta a quantidade de potes do pedido
  const base =
    unidades <= 1
      ? { altura: 12, largura: 9, comprimento: 8 }
      : unidades <= 2
        ? { altura: 12, largura: 13, comprimento: 9 }
        : { altura: 14, largura: 16, comprimento: 12 };
  return {
    height: base.altura,
    width: base.largura,
    length: base.comprimento,
    weight: Number((UNIDADE.pesoKg * unidades + 0.05).toFixed(2)), // +50g embalagem
  };
}

export type Oferta = {
  id: "essencial" | "duo" | "completo";
  nome: string;
  subtitulo: string;
  badge?: string;
  destaque?: boolean;
  unidades: number; // total de potes
  precoDe: number;
  precoPor: number;
  /** true = cliente monta a composição (goma/cápsula); false = escolhe 1 tipo */
  montavel: boolean;
  /** texto das composições sugeridas (opção completa) */
  composicoes?: string[];
  beneficios: string[];
  freteGratis: boolean;
};

export const OFERTAS: Oferta[] = [
  {
    id: "essencial",
    nome: "Tratamento 30 Dias",
    subtitulo: "O primeiro passo para o cabelo dos seus sonhos",
    unidades: 1,
    precoDe: 149,
    precoPor: 97,
    montavel: false, // 1 pote de goma OU 1 de cápsula
    beneficios: [
      "1 pote à sua escolha: goma ou cápsula",
      "Fórmula avançada de nutrição capilar",
      "Ideal para conhecer o tratamento",
    ],
    freteGratis: true,
  },
  {
    id: "duo",
    nome: "Tratamento Duo",
    subtitulo: "A dupla que potencializa os resultados",
    badge: "MELHOR DUPLA",
    unidades: 2,
    precoDe: 194,
    precoPor: 174,
    montavel: true, // 1 de cada OU 2 à escolha
    composicoes: ["1 goma + 1 cápsula", "2 gomas", "2 cápsulas"],
    beneficios: [
      "2 potes para montar como quiser",
      "Goma + cápsula agem em sinergia",
      "60 dias de tratamento contínuo",
    ],
    freteGratis: true,
  },
  {
    id: "completo",
    nome: "Tratamento Completo 3 Meses",
    subtitulo: "O protocolo que entrega o resultado de verdade",
    badge: "🔥 MAIS VENDIDO",
    destaque: true,
    unidades: 3,
    precoDe: 388,
    precoPor: 225,
    montavel: true,
    composicoes: ["2 gomas + 1 cápsula", "3 gomas", "3 cápsulas"],
    beneficios: [
      "3 potes para montar do seu jeito",
      "Tratamento completo de 90 dias",
      "Melhor custo-benefício (R$ 75/mês)",
      "Maior adesão = maior resultado",
    ],
    freteGratis: true,
  },
];

export const getOferta = (id: string) => OFERTAS.find((o) => o.id === id);

/** Formata número em BRL */
export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Endereço de entrega coletado no checkout (usado pelo Melhor Envio). */
export type Endereco = {
  nome: string;
  cpf: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export const ENDERECO_VAZIO: Endereco = {
  nome: "",
  cpf: "",
  telefone: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};

/** Verifica se os campos obrigatórios do endereço estão preenchidos. */
export const enderecoValido = (e: Endereco): boolean =>
  !!(
    e.nome.trim() &&
    e.cep.replace(/\D/g, "").length === 8 &&
    e.rua.trim() &&
    e.numero.trim() &&
    e.bairro.trim() &&
    e.cidade.trim() &&
    e.uf.trim()
  );
