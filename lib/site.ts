/**
 * ============================================================
 *  SIS BEAUTY — Configuração central do site
 * ============================================================
 *  Dados públicos usados em vários lugares (footer, páginas
 *  legais, JSON-LD, WhatsApp). Centralizado para não duplicar.
 * ============================================================
 */

export const SITE = {
  nome: "SIS Beauty",
  dominio: "https://sisbeauty.com.br",
  slogan: "Cuidado capilar de verdade, do jeito que você merece.",
  descricao:
    "Tratamento capilar SIS Beauty: gomas e cápsulas com fórmula avançada para acelerar o crescimento, fortalecer e dar mais brilho aos seus cabelos.",

  contato: {
    // WhatsApp em formato internacional, só dígitos (DDI + DDD + número)
    whatsapp: "5562994528264",
    whatsappDisplay: "(62) 9 9452-8264",
    instagram: "https://instagram.com/sisbeauty",
    email: "contato@sisbeauty.com.br",
  },

  /**
   * Dados da empresa — EXIGIDOS por lei para venda online (CDC).
   * ⚠️ PREENCHA com o CNPJ real (recomendado abrir MEI). Evite publicar
   * o seu CPF pessoal em site público.
   */
  empresa: {
    razaoSocial: "SIS Beauty",
    documento: "CNPJ 00.000.000/0001-00", // TODO: substituir pelo CNPJ real
    endereco:
      "Av. A, Qd. 32, Lt. 09 — Vila Lucy, Goiânia/GO, CEP 74320-020",
  },
} as const;

/** Monta o link do WhatsApp com uma mensagem pré-preenchida. */
export const waLink = (
  texto = "Olá! Quero saber mais sobre o tratamento SIS Beauty 💜"
) => `https://wa.me/${SITE.contato.whatsapp}?text=${encodeURIComponent(texto)}`;
