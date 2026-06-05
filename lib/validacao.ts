/**
 * Validação e máscaras de campos brasileiros (CPF, telefone, CEP).
 * Funções puras — seguras no cliente e no servidor.
 */

export const soDigitos = (v?: string) => String(v ?? "").replace(/\D/g, "");

export function mascaraCPF(v: string): string {
  return soDigitos(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function mascaraTelefone(v: string): string {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function mascaraCEP(v: string): string {
  return soDigitos(v)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

/** Valida CPF pelos dígitos verificadores. */
export function cpfValido(v: string): boolean {
  const c = soDigitos(v);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(c[i]) * (10 - i);
  let d1 = 11 - (soma % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== Number(c[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(c[i]) * (11 - i);
  let d2 = 11 - (soma % 11);
  if (d2 >= 10) d2 = 0;
  return d2 === Number(c[10]);
}

/** Telefone com 10 (fixo) ou 11 (celular) dígitos. */
export const telefoneValido = (v: string) => {
  const d = soDigitos(v);
  return d.length === 10 || d.length === 11;
};

/**
 * Normaliza qualquer formato de telefone brasileiro para E.164 sem o "+":
 *   55 + DDD (2) + 9 + número (8) = 13 dígitos
 *
 * Aceita entradas como:
 *   "(62) 9 9999-9999"  → "5562999999999"
 *   "62999999999"       → "5562999999999"
 *   "6299999999"        → "5562999999999"  (insere o 9 do celular)
 *   "5562999999999"     → "5562999999999"  (já correto)
 *
 * Usado nos webhooks para garantir compatibilidade com WhatsApp API,
 * CRMs, Make/n8n e qualquer sistema que exija formato internacional.
 */
export function normalizarTelefone(v?: string): string {
  const d = soDigitos(v);
  if (!d) return "";

  // 1. Já está no formato completo: 55 + DDD + 9 + 8 dígitos = 13
  if (d.length === 13 && d.startsWith("55")) return d;

  // 2. Tem código de país mas sem o dígito 9 do celular: 55 + DDD + 8 = 12
  if (d.length === 12 && d.startsWith("55")) {
    const ddd = d.slice(2, 4);
    const num = d.slice(4);
    return "55" + ddd + "9" + num;
  }

  // 3. Formato padrão brasileiro com celular: DDD(2) + 9 + 8 = 11 dígitos
  if (d.length === 11) return "55" + d;

  // 4. Formato antigo sem o dígito 9: DDD(2) + 8 = 10 dígitos
  if (d.length === 10) {
    const ddd = d.slice(0, 2);
    const num = d.slice(2);
    return "55" + ddd + "9" + num;
  }

  // 5. Só o número sem DDD (8 ou 9 dígitos) — mantém com 55, sem DDD
  return "55" + d;
}
