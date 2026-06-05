/**
 * Teste direto da integração com o Melhor Envio.
 * Simula exatamente o que o webhook faz após um pagamento aprovado.
 * Execute com: node scripts/test-etiqueta.mjs
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Lê o .env.local manualmente
const envPath = resolve(process.cwd(), ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const ME_BASE = env.MELHOR_ENVIO_URL || "https://www.melhorenvio.com.br";
const ME_TOKEN = env.MELHOR_ENVIO_TOKEN;
const SERVICO = Number(env.MELHOR_ENVIO_SERVICO) || 1;

const REMETENTE = {
  name: env.LOJA_NOME,
  phone: env.LOJA_TELEFONE,
  email: env.LOJA_EMAIL,
  document: env.LOJA_DOCUMENTO,
  postal_code: env.CEP_ORIGEM,
  address: env.LOJA_ENDERECO,
  number: env.LOJA_NUMERO,
  district: env.LOJA_BAIRRO,
  city: env.LOJA_CIDADE,
  state_abbr: env.LOJA_UF,
};

// Dados fictícios do cliente — substitua pelo seu CEP real para testar prazo
const DESTINATARIO = {
  name: "Cliente Teste",
  phone: "62999999999",
  email: "teste@sisbeauty.com.br",
  document: "529.982.247-25",
  postal_code: "01310100", // Av. Paulista SP — só para teste
  address: "Av. Paulista",
  number: "1000",
  complement: "",
  district: "Bela Vista",
  city: "São Paulo",
  state_abbr: "SP",
};

const headers = {
  Authorization: `Bearer ${ME_TOKEN}`,
  "Content-Type": "application/json",
  Accept: "application/json",
  "User-Agent": `SIS Beauty (${env.LOJA_EMAIL})`,
};

async function testar() {
  console.log("\n🧪 TESTE DE INTEGRAÇÃO — MELHOR ENVIO\n");
  console.log("Remetente:", REMETENTE.name, "|", REMETENTE.postal_code, "|", REMETENTE.address, REMETENTE.number);
  console.log("Destinatário:", DESTINATARIO.name, "|", DESTINATARIO.postal_code, "\n");

  // ── ETAPA 1: Adicionar ao carrinho ──────────────────────────────
  console.log("1️⃣  Adicionando ao carrinho do Melhor Envio...");
  const cartRes = await fetch(`${ME_BASE}/api/v2/me/cart`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      service: SERVICO,
      from: REMETENTE,
      to: DESTINATARIO,
      products: [{ name: "SIS Beauty (Teste)", quantity: 1, unitary_value: 97 }],
      volumes: [{ height: 12, width: 13, length: 9, weight: 0.4 }],
      options: {
        insurance_value: 97,
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: true,
        invoice: { key: "" },
      },
    }),
  });

  const cart = await cartRes.json();

  if (!cart?.id) {
    console.error("❌ FALHA ao adicionar ao carrinho:");
    console.error(JSON.stringify(cart, null, 2));
    return;
  }

  console.log(`✅ Item adicionado ao carrinho! Order ID: ${cart.id}`);
  console.log(`   Serviço: ${cart.service?.name || SERVICO} | Preço: R$ ${cart.price || "?"} | Prazo: ${cart.delivery_time || "?"}d\n`);

  // ── ETAPA 2: Checkout (compra o frete — debita saldo) ───────────
  console.log("2️⃣  Comprando o frete (debita saldo da conta ME)...");
  const checkoutRes = await fetch(`${ME_BASE}/api/v2/me/shipment/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify({ orders: [cart.id] }),
  });

  const checkout = await checkoutRes.json();

  if (!checkoutRes.ok) {
    console.error("❌ FALHA no checkout do frete:");
    console.error(JSON.stringify(checkout, null, 2));
    console.log("\n⚠️  Verifique se há saldo na sua conta do Melhor Envio.");
    console.log("   Acesse: https://app.melhorenvio.com.br/perfil/saldo");
    return;
  }

  console.log("✅ Frete comprado!\n");

  // ── ETAPA 3: Gerar etiqueta ─────────────────────────────────────
  console.log("3️⃣  Gerando a etiqueta...");
  const generateRes = await fetch(`${ME_BASE}/api/v2/me/shipment/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ orders: [cart.id] }),
  });

  const generated = await generateRes.json();

  if (!generateRes.ok) {
    console.error("❌ FALHA ao gerar etiqueta:");
    console.error(JSON.stringify(generated, null, 2));
    return;
  }

  console.log("✅ Etiqueta gerada com sucesso!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 INTEGRAÇÃO FUNCIONANDO! Tudo certo.");
  console.log("   Acesse sua conta do Melhor Envio para ver e imprimir:");
  console.log("   https://app.melhorenvio.com.br/envios/geradas");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

testar().catch((e) => {
  console.error("Erro inesperado:", e.message);
});
