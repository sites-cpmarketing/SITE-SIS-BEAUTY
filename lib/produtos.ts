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

import { cpfValido, telefoneValido } from "@/lib/validacao";

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
  resultado2: "/fotos/resultado-2.jpeg",
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

/**
 * Lê um número de variável de ambiente; usa o padrão se ausente/inválido.
 * (Só roda no servidor — pacoteParaQuantidade é usada apenas nas rotas de API.)
 */
function envNum(chave: string, padrao: number): number {
  const v = Number(process.env[chave]);
  return Number.isFinite(v) && v > 0 ? v : padrao;
}

/**
 * Embalagem de envio por faixa de quantidade (cm/kg).
 * Tudo é configurável pelo .env — se a variável não existir, usa o padrão abaixo.
 *
 *   PACOTE_PESO_UNITARIO   peso de 1 pote cheio (kg)        [padrão 0.18]
 *   PACOTE_PESO_EMBALAGEM  peso extra da caixa/plástico (kg)[padrão 0.05]
 *   PACOTE_{1,2,3}_ALTURA / _LARGURA / _COMPRIMENTO   dimensões da caixa (cm)
 *     faixa 1 = até 1 pote · faixa 2 = até 2 · faixa 3 = 3 ou mais
 */
export function pacoteParaQuantidade(unidades: number) {
  const pesoUnit = envNum("PACOTE_PESO_UNITARIO", UNIDADE.pesoKg);
  const pesoEmbalagem = envNum("PACOTE_PESO_EMBALAGEM", 0.05);

  // Faixa e dimensões-padrão correspondentes
  const faixa = unidades <= 1 ? "1" : unidades <= 2 ? "2" : "3";
  const padrao =
    unidades <= 1
      ? { altura: 12, largura: 9, comprimento: 8 }
      : unidades <= 2
        ? { altura: 12, largura: 13, comprimento: 9 }
        : { altura: 14, largura: 16, comprimento: 12 };

  return {
    height: envNum(`PACOTE_${faixa}_ALTURA`, padrao.altura),
    width: envNum(`PACOTE_${faixa}_LARGURA`, padrao.largura),
    length: envNum(`PACOTE_${faixa}_COMPRIMENTO`, padrao.comprimento),
    weight: Number((pesoUnit * unidades + pesoEmbalagem).toFixed(2)),
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
    nome: "Kit 3 Meses",
    subtitulo: "Mais potes, mais resultado, mesmo investimento",
    badge: "🎁 PAGUE 2, LEVE 3",
    unidades: 3,
    precoDe: 291,
    precoPor: 174,
    montavel: true,
    composicoes: ["3 gomas", "3 cápsulas", "2 gomas + 1 cápsula", "1 goma + 2 cápsulas"],
    beneficios: [
      "3 meses de tratamento contínuo",
      "Nutrição profunda e fortalecimento dos fios",
      "Resultados visíveis a partir do 1º mês",
    ],
    freteGratis: true,
  },
  {
    id: "completo",
    nome: "Kit 6 Meses",
    subtitulo: "O tratamento completo para transformação definitiva",
    badge: "🔥 COMPRE 5, LEVE 6",
    destaque: true,
    unidades: 6,
    precoDe: 582,
    precoPor: 294,
    montavel: true,
    composicoes: ["6 gomas", "6 cápsulas", "3 gomas + 3 cápsulas", "4 gomas + 2 cápsulas", "2 gomas + 4 cápsulas"],
    beneficios: [
      "6 meses de nutrição capilar intensiva",
      "Máxima adesão para transformação duradoura",
      "O kit mais econômico por pote do site",
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
  email: string;
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
  email: "",
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

/** Verifica se os campos obrigatórios do endereço estão preenchidos e válidos.
 *  CPF e telefone são obrigatórios — o Melhor Envio exige CPF válido para gerar
 *  a etiqueta de envio. */
export const enderecoValido = (e: Endereco): boolean =>
  !!(
    e.nome.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.email) &&
    cpfValido(e.cpf) &&
    telefoneValido(e.telefone) &&
    e.cep.replace(/\D/g, "").length === 8 &&
    e.rua.trim() &&
    e.numero.trim() &&
    e.bairro.trim() &&
    e.cidade.trim() &&
    e.uf.trim()
  );
