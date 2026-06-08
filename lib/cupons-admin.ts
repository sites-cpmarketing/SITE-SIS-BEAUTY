/**
 * ============================================================
 *  Cupons dinâmicos — persistência via Vercel KV (Redis)
 * ============================================================
 *  Usado apenas no servidor (API routes).
 *  Se o KV não estiver configurado, as funções retornam [] ou
 *  lançam erro explicativo.
 * ============================================================
 */

import type { Cupom } from "./cupons";
import { CUPONS, aplicarCupom } from "./cupons";

const KV_KEY = "cupons:dinamicos";

function getRedis() {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  // Importação dinâmica para não quebrar o bundle do cliente
  const { Redis } = require("@upstash/redis") as typeof import("@upstash/redis");
  return new Redis({ url, token });
}

export async function kvConfigurado(): Promise<boolean> {
  return getRedis() !== null;
}

export async function listarCuponsKV(): Promise<Cupom[]> {
  try {
    const redis = getRedis();
    if (!redis) return [];
    const lista = await redis.get<Cupom[]>(KV_KEY);
    return lista ?? [];
  } catch {
    return [];
  }
}

export async function criarCupomKV(cupom: Cupom): Promise<void> {
  const redis = getRedis();
  if (!redis)
    throw new Error(
      "Upstash Redis não configurado. Crie um Redis no Vercel (Upstash) e conecte ao projeto."
    );
  const lista = await listarCuponsKV();
  if (lista.some((c) => c.codigo === cupom.codigo))
    throw new Error(`O código "${cupom.codigo}" já existe nos cupons dinâmicos.`);
  await redis.set(KV_KEY, [...lista, cupom]);
}

export async function atualizarCupomKV(
  codigo: string,
  dados: Partial<Cupom>
): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Upstash Redis não configurado.");
  const lista = await listarCuponsKV();
  const idx = lista.findIndex((c) => c.codigo === codigo);
  if (idx === -1) throw new Error("Cupom não encontrado.");
  lista[idx] = { ...lista[idx], ...dados };
  await redis.set(KV_KEY, lista);
}

export async function deletarCupomKV(codigo: string): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Upstash Redis não configurado.");
  const lista = await listarCuponsKV();
  await redis.set(KV_KEY, lista.filter((c) => c.codigo !== codigo));
}

/**
 * Versão servidor de buscarCupom — verifica cupons estáticos E dinâmicos (KV).
 * Use esta função em API routes que precisam validar cupons.
 */
export async function buscarCupomServidor(
  codigo: string | undefined | null,
  totalPedido?: number
): Promise<Cupom | null> {
  const c = String(codigo ?? "").trim().toUpperCase();
  if (!c) return null;

  const dinamicos = await listarCuponsKV();
  const todos: Cupom[] = [...CUPONS, ...dinamicos];

  const cupom = todos.find((x) => x.codigo === c);
  if (!cupom) return null;
  if (cupom.ativo === false) return null;
  if (cupom.expira) {
    const hoje = new Date().toISOString().slice(0, 10);
    if (hoje > cupom.expira) return null;
  }
  if (cupom.minimo !== undefined && totalPedido !== undefined) {
    if (totalPedido < cupom.minimo) return null;
  }
  return cupom;
}

/**
 * Versão servidor de aplicarCupom — usa buscarCupomServidor internamente.
 */
export async function aplicarCupomServidor(
  total: number,
  codigo: string | undefined | null
): Promise<number> {
  const cupom = await buscarCupomServidor(codigo, total);
  return aplicarCupom(total, cupom);
}
