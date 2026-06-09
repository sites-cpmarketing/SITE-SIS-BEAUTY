"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  OFERTAS,
  brl,
  IMG,
  ENDERECO_VAZIO,
  enderecoValido,
  type Oferta,
  type Endereco,
} from "@/lib/produtos";
import { aplicarCupom, fatorCupomPorOferta, type Cupom } from "@/lib/cupons";
import {
  mascaraCPF,
  mascaraTelefone,
  mascaraCEP,
  cpfValido,
} from "@/lib/validacao";
import { trackEvent } from "@/lib/tracking";

export default function Ofertas() {
  const [sel, setSel] = useState<Oferta>(OFERTAS[2]);
  const [aberto, setAberto] = useState(false); // painel abre ao escolher um plano
  const [qtdGoma, setQtdGoma] = useState(0);
  const [qtdCapsula, setQtdCapsula] = useState(0);
  const [end, setEnd] = useState<Endereco>(ENDERECO_VAZIO);
  const [cepLoad, setCepLoad] = useState(false);
  const [cepErro, setCepErro] = useState("");
  const [checkoutLoad, setCheckoutLoad] = useState(false);
  const [checkoutErro, setCheckoutErro] = useState("");
  const [cupomCodigo, setCupomCodigo] = useState("");
  const [cupom, setCupom] = useState<Cupom | null>(null);
  const [cupomErro, setCupomErro] = useState("");

  const soma = qtdGoma + qtdCapsula;
  const escolhaFeita = soma === sel.unidades && sel.unidades > 0;
  const podeAdicionar = soma < sel.unidades;

  const setCampo = (k: keyof Endereco, v: string) =>
    setEnd((e) => ({ ...e, [k]: v }));

  function resetEscolhas() {
    setQtdGoma(0);
    setQtdCapsula(0);
    setEnd(ENDERECO_VAZIO);
    setCepErro("");
    setCheckoutErro("");
    setCupomCodigo("");
    setCupom(null);
    setCupomErro("");
  }

  async function aplicarCupomCodigo() {
    if (!cupomCodigo.trim()) return;
    setCupomErro("");
    try {
      const r = await fetch("/api/cupom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: cupomCodigo, total: sel.precoPor }),
      });
      const d = await r.json();
      if (!d.valido) {
        setCupom(null);
        setCupomErro("Cupom inválido ou inexistente.");
        return;
      }
      setCupom(d.cupom);
      setCupomErro("");
    } catch {
      setCupomErro("Erro ao verificar o cupom. Tente novamente.");
    }
  }

  // Busca o endereço pelo CEP (ViaCEP) e preenche rua/bairro/cidade/UF.
  async function buscarCep(cepRaw: string) {
    const cep = cepRaw.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoad(true);
    setCepErro("");
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d.erro) {
        setCepErro("CEP não encontrado. Confira o número.");
        return;
      }
      setEnd((e) => ({
        ...e,
        rua: d.logradouro || e.rua,
        bairro: d.bairro || e.bairro,
        cidade: d.localidade || e.cidade,
        uf: d.uf || e.uf,
      }));
    } catch {
      setCepErro("Não foi possível buscar o CEP agora. Preencha manualmente.");
    } finally {
      setCepLoad(false);
    }
  }

  function selecionar(o: Oferta) {
    setSel(o);
    setAberto(true);
    resetEscolhas();
    setTimeout(
      () =>
        document
          .getElementById("finalizar")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      90
    );
  }

  function descricaoEscolha(): string {
    const p: string[] = [];
    if (qtdGoma > 0) p.push(`${qtdGoma} goma${qtdGoma > 1 ? "s" : ""}`);
    if (qtdCapsula > 0)
      p.push(`${qtdCapsula} cápsula${qtdCapsula > 1 ? "s" : ""}`);
    return p.join(" + ");
  }

  const imgResumo =
    qtdCapsula > 0 && qtdGoma === 0 ? IMG.mockupCapsula : IMG.mockupGoma;

  // Kits de 3 e 6 meses recebem metade do desconto do cupom.
  const fatorCupom = fatorCupomPorOferta(sel.id);
  // Frete grátis: total = valor do produto com o desconto do cupom (se houver).
  const total = aplicarCupom(sel.precoPor, cupom, fatorCupom);
  const cpfInvalido = end.cpf.length > 0 && !cpfValido(end.cpf);
  const enderecoOk = enderecoValido(end);
  const podeFinalizar = escolhaFeita && enderecoOk && !checkoutLoad;

  // Dispara uma vez quando o formulário fica completo (botão liberado).
  // Reseta se o usuário invalida o form para capturar novamente ao revalidar.
  const checkoutLeadEnviado = useRef(false);
  useEffect(() => {
    if (podeFinalizar && !checkoutLeadEnviado.current) {
      checkoutLeadEnviado.current = true;
      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fonte:       "checkout",
          nome:        end.nome,
          telefone:    end.telefone,
          cpf:         end.cpf,
          cep:         end.cep,
          rua:         end.rua,
          numero:      end.numero,
          complemento: end.complemento,
          bairro:      end.bairro,
          cidade:      end.cidade,
          uf:          end.uf,
          produto:     sel.nome,
          qtd_goma:    qtdGoma,
          qtd_capsula: qtdCapsula,
          total:       brl(total),
          cupom:       cupom?.codigo ?? "",
        }),
      }).catch(() => {}); // fire-and-forget, nunca bloqueia o fluxo
    }
    if (!podeFinalizar) {
      checkoutLeadEnviado.current = false; // reseta se form ficar inválido
    }
  }, [podeFinalizar]); // eslint-disable-line react-hooks/exhaustive-deps

  async function finalizar() {
    if (!escolhaFeita || !enderecoOk) return;
    setCheckoutLoad(true);
    setCheckoutErro("");
    trackEvent("InitiateCheckout", { value: total, currency: "BRL" });
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ofertaId: sel.id,
          descricao: descricaoEscolha(),
          qtdGoma,
          qtdCapsula,
          cupom: cupom?.codigo ?? "",
          // Endereço de entrega — usado pelo webhook p/ gerar a etiqueta
          endereco: { ...end, cep: end.cep.replace(/\D/g, "") },
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.init_point)
        throw new Error(data?.error || "Não foi possível iniciar o pagamento.");
      window.location.assign(data.init_point);
    } catch (e) {
      setCheckoutErro(
        e instanceof Error ? e.message : "Erro ao iniciar o pagamento."
      );
      setCheckoutLoad(false);
    }
  }

  return (
    <section id="ofertas" className="bg-cream py-14 px-4 md:py-20 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10 md:mb-14" data-reveal>
          <p className="text-rose font-semibold tracking-[0.2em] text-sm uppercase mb-3">
            Escolha seu tratamento
          </p>
          <h2 className="text-4xl md:text-5xl mb-4">
            Comece sua transformação hoje
          </h2>
          <p className="text-cacau-soft max-w-2xl mx-auto">
            Mesmo tratamento, duas apresentações: <strong>goma</strong> ou{" "}
            <strong>cápsula</strong>. Monte o seu kit do jeito que preferir.
            Quanto maior o tratamento, melhor o resultado.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose-light px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-cacau">
            🔥 Promoção de lançamento · frete grátis para todo o Brasil
          </span>
        </div>

        {/* Cards das ofertas */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {OFERTAS.map((o, idx) => {
            const ativo = aberto && sel.id === o.id;
            const desconto = Math.round(
              ((o.precoDe - o.precoPor) / o.precoDe) * 100
            );
            return (
              <div
                key={o.id}
                data-reveal
                data-delay={idx + 1}
                className={`relative flex flex-col rounded-3xl border-2 bg-perola p-7 transition-all ${
                  o.destaque
                    ? "border-rose shadow-[0_20px_60px_-15px_rgba(185,135,120,0.45)] md:scale-[1.04]"
                    : "border-rose-light"
                } ${ativo ? "ring-2 ring-champagne ring-offset-2 ring-offset-cream" : ""}`}
              >
                {o.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-xs font-bold tracking-wide ${
                      o.destaque ? "bg-rose text-white" : "bg-champagne text-cacau"
                    }`}
                  >
                    {o.badge}
                  </span>
                )}
                <h3 className="text-2xl mt-2">{o.nome}</h3>
                <p className="text-sm text-cacau-soft mt-1 mb-4 min-h-[40px]">
                  {o.subtitulo}
                </p>

                <div className="mb-4">
                  <span className="text-sm text-cacau-soft line-through">
                    De {brl(o.precoDe)}
                  </span>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-rose">
                      {brl(o.precoPor)}
                    </span>
                    <span className="mb-1 rounded bg-rose-light px-2 py-0.5 text-xs font-bold text-cacau">
                      -{desconto}%
                    </span>
                  </div>
                  <p className="text-xs text-cacau-soft mt-1">
                    ou 12x de {brl(o.precoPor / 12)}
                  </p>
                  {o.unidades > 1 && (
                    <p className="text-xs font-bold text-rose mt-1">
                      = {brl(o.precoPor / o.unidades)} por pote
                    </p>
                  )}
                  {o.freteGratis && (
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      🚚 Frete grátis para todo o Brasil
                    </span>
                  )}
                </div>


                <ul className="space-y-2 mb-6 flex-1">
                  {o.beneficios.map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm text-cacau">
                      <span className="text-champagne">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => selecionar(o)}
                  className={`w-full rounded-full py-3.5 font-semibold ${
                    o.destaque || ativo
                      ? "btn-primary"
                      : "border-2 border-rose text-rose hover:bg-rose hover:text-white transition-colors"
                  }`}
                >
                  {ativo ? "✓ Selecionado" : "Quero este"}
                </button>
              </div>
            );
          })}
        </div>

        {/* ===== Painel de finalização — abre ao escolher um plano ===== */}
        {aberto && (
          <div
            id="finalizar"
            className="mt-12 rounded-3xl bg-perola border border-rose-light p-6 md:p-9 shadow-soft scroll-mt-24 fade-up"
          >
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Esquerda: passos */}
              <div>
                <h3 className="text-2xl mb-1">Finalize seu pedido</h3>
                <p className="text-sm text-cacau-soft mb-6">
                  Plano selecionado:{" "}
                  <strong className="text-rose">{sel.nome}</strong>
                </p>

                {/* PASSO 1 — montar kit (goma x cápsula) */}
                <Passo
                  n={1}
                  titulo={`Monte seu kit: ${sel.unidades} ${sel.unidades > 1 ? "potes" : "pote"}`}
                  feito={escolhaFeita}
                >
                  <div className="space-y-3">
                    <Stepper
                      img={IMG.mockupGoma}
                      nome="Goma"
                      sub="Sabor creme de baunilha"
                      qtd={qtdGoma}
                      podeAdd={podeAdicionar}
                      onAdd={() => setQtdGoma((q) => q + 1)}
                      onSub={() => setQtdGoma((q) => Math.max(0, q - 1))}
                    />
                    <Stepper
                      img={IMG.mockupCapsula}
                      nome="Cápsula"
                      sub="Fórmula concentrada"
                      qtd={qtdCapsula}
                      podeAdd={podeAdicionar}
                      onAdd={() => setQtdCapsula((q) => q + 1)}
                      onSub={() => setQtdCapsula((q) => Math.max(0, q - 1))}
                    />
                    {/* Contador */}
                    <div
                      className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold ${
                        escolhaFeita
                          ? "bg-rose text-white"
                          : "bg-rose-light/50 text-cacau"
                      }`}
                    >
                      <span>
                        {soma} de {sel.unidades} potes selecionados
                      </span>
                      <span>
                        {escolhaFeita
                          ? "Kit completo ✓"
                          : `faltam ${sel.unidades - soma}`}
                      </span>
                    </div>
                  </div>
                </Passo>

                {/* PASSO 2 — endereço de entrega (frete grátis) */}
                {escolhaFeita && (
                  <div className="fade-up">
                    <Passo
                      n={2}
                      titulo="Endereço de entrega"
                      feito={enderecoOk}
                    >
                      <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                        🚚 Frete grátis — você não paga nada pelo envio.
                      </div>
                      <div className="space-y-3">
                        <Campo
                          label="Nome completo"
                          value={end.nome}
                          onChange={(v) => setCampo("nome", v)}
                          placeholder="Quem vai receber"
                        />
                        <Campo
                          label="E-mail"
                          value={end.email}
                          onChange={(v) => setCampo("email", v)}
                          placeholder="seu@email.com"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Campo
                              label="CPF"
                              value={end.cpf}
                              onChange={(v) => setCampo("cpf", mascaraCPF(v))}
                              placeholder="000.000.000-00"
                              inputMode="numeric"
                              maxLength={14}
                            />
                            {cpfInvalido && (
                              <p className="mt-1 text-xs text-red-600">
                                CPF inválido — confira os números.
                              </p>
                            )}
                          </div>
                          <Campo
                            label="Telefone"
                            value={end.telefone}
                            onChange={(v) => setCampo("telefone", mascaraTelefone(v))}
                            placeholder="(00) 00000-0000"
                            inputMode="numeric"
                            maxLength={15}
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-cacau-soft">
                            CEP
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              inputMode="numeric"
                              placeholder="00000-000"
                              value={end.cep}
                              maxLength={9}
                              onChange={(e) => {
                                setCampo("cep", mascaraCEP(e.target.value));
                                if (cepErro) setCepErro("");
                              }}
                              onBlur={(e) => buscarCep(e.target.value)}
                              className="w-40 rounded-xl border-2 border-rose-light bg-white px-4 py-3 outline-none focus:border-rose"
                            />
                            {cepLoad && (
                              <span className="text-xs text-cacau-soft">
                                buscando…
                              </span>
                            )}
                            <a
                              href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-rose underline"
                            >
                              não sei meu CEP
                            </a>
                          </div>
                          {cepErro && (
                            <p className="mt-1 text-sm text-red-600">{cepErro}</p>
                          )}
                        </div>

                        <Campo
                          label="Rua / Logradouro"
                          value={end.rua}
                          onChange={(v) => setCampo("rua", v)}
                          placeholder="Preenchido pelo CEP"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Campo
                            label="Número"
                            value={end.numero}
                            onChange={(v) => setCampo("numero", v)}
                            placeholder="123"
                            inputMode="numeric"
                          />
                          <Campo
                            label="Complemento"
                            value={end.complemento}
                            onChange={(v) => setCampo("complemento", v)}
                            placeholder="Apto, bloco (opcional)"
                          />
                        </div>
                        <Campo
                          label="Bairro"
                          value={end.bairro}
                          onChange={(v) => setCampo("bairro", v)}
                          placeholder="Preenchido pelo CEP"
                        />
                        <div className="grid grid-cols-[1fr,90px] gap-3">
                          <Campo
                            label="Cidade"
                            value={end.cidade}
                            onChange={(v) => setCampo("cidade", v)}
                            placeholder="Preenchido pelo CEP"
                          />
                          <Campo
                            label="UF"
                            value={end.uf}
                            onChange={(v) => setCampo("uf", v.toUpperCase())}
                            placeholder="UF"
                            maxLength={2}
                          />
                        </div>
                      </div>
                    </Passo>
                  </div>
                )}
              </div>

              {/* Direita: resumo */}
              <div className="rounded-2xl bg-cream p-6 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-perola">
                    <Image
                      src={imgResumo}
                      alt="Produto SIS Beauty"
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{sel.nome}</p>
                    <p className="text-sm text-cacau-soft">
                      {descricaoEscolha() || "Monte seu kit ao lado"}
                    </p>
                  </div>
                </div>

                {/* Cupom de desconto — vale para todas as ofertas.
                    Nos kits de 3 e 6 meses o desconto vale metade. */}
                <div className="mb-3">
                  <div className="flex gap-2">
                    <input
                      value={cupomCodigo}
                      onChange={(e) => {
                        setCupomCodigo(e.target.value.toUpperCase());
                        if (cupomErro) setCupomErro("");
                      }}
                      placeholder="Cupom de desconto"
                      className="w-full flex-1 rounded-xl border-2 border-rose-light bg-white px-3 py-2.5 text-sm uppercase outline-none focus:border-rose"
                    />
                    <button
                      type="button"
                      onClick={aplicarCupomCodigo}
                      className="shrink-0 rounded-xl border-2 border-rose px-4 text-sm font-semibold text-rose transition-colors hover:bg-rose hover:text-white"
                    >
                      Aplicar
                    </button>
                  </div>
                  {cupomErro && (
                    <p className="mt-1 text-xs text-red-600">{cupomErro}</p>
                  )}
                  {cupom && (
                    <p className="mt-1 text-xs font-semibold text-emerald-600">
                      ✓ Cupom {cupom.codigo} aplicado
                      {fatorCupom < 1 && cupom.tipo === "percentual"
                        ? ` — ${(cupom.valor * fatorCupom).toLocaleString("pt-BR")}% neste kit`
                        : ""}
                    </p>
                  )}
                  {!cupom && fatorCupom < 1 && (
                    <p className="mt-1 text-xs text-cacau-soft">
                      Cupons valem metade do desconto nos kits de 3 e 6 meses.
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-sm border-t border-rose-light pt-4">
                  <Row label="Produto" value={brl(sel.precoPor)} />
                  {cupom && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Desconto ({cupom.codigo})</span>
                      <span>− {brl(sel.precoPor - total)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-cacau-soft">Frete</span>
                    <span className="font-semibold text-emerald-600">
                      Grátis 🚚
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-rose-light pt-3 mt-1 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-rose">{brl(total)}</span>
                  </div>
                  <p className="text-xs text-cacau-soft">
                    ou 12x de {brl(total / 12)} no cartão
                  </p>
                </div>

                {/* PASSO 3 — checkout (libera após o frete) */}
                <button
                  onClick={finalizar}
                  disabled={!podeFinalizar}
                  className="btn-primary mt-5 w-full rounded-full py-4 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkoutLoad
                    ? "Redirecionando..."
                    : !escolhaFeita
                      ? "Monte seu kit para continuar"
                      : !enderecoOk
                        ? "Preencha o endereço para continuar"
                        : "🔒 Comprar agora · Frete grátis"}
                </button>
                {checkoutErro && (
                  <p className="mt-2 text-sm text-red-600">{checkoutErro}</p>
                )}
                <p className="mt-3 text-center text-xs text-cacau-soft">
                  Pagamento seguro via Mercado Pago · Pix, cartão ou boleto
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* Seletor de quantidade (goma / cápsula) */
function Stepper({
  img,
  nome,
  sub,
  qtd,
  podeAdd,
  onAdd,
  onSub,
}: {
  img: string;
  nome: string;
  sub: string;
  qtd: number;
  podeAdd: boolean;
  onAdd: () => void;
  onSub: () => void;
}) {
  const ativo = qtd > 0;
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 p-2.5 transition-colors ${
        ativo ? "border-rose bg-rose-light/40" : "border-rose-light"
      }`}
    >
      <div className="relative h-12 w-10 shrink-0">
        <Image src={img} alt={nome} fill className="object-contain" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold leading-tight">{nome}</p>
        <p className="text-xs text-cacau-soft">{sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSub}
          disabled={qtd === 0}
          aria-label={`Diminuir ${nome}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-rose text-rose font-bold disabled:opacity-30"
        >
          −
        </button>
        <span className="w-6 text-center text-lg font-bold tabular-nums">
          {qtd}
        </span>
        <button
          type="button"
          onClick={onAdd}
          disabled={!podeAdd}
          aria-label={`Aumentar ${nome}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-white font-bold disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Passo({
  n,
  titulo,
  feito,
  children,
}: {
  n: number;
  titulo: string;
  feito: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            feito ? "bg-rose text-white" : "bg-rose-light text-cacau"
          }`}
        >
          {feito ? "✓" : n}
        </span>
        <label className="text-sm font-semibold">{titulo}</label>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-cacau-soft">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/* Campo de texto do formulário de endereço */
function Campo({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "numeric";
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-cacau-soft">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full rounded-xl border-2 border-rose-light bg-white px-4 py-3 outline-none focus:border-rose"
      />
    </label>
  );
}
