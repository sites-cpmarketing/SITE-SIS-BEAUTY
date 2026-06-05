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
