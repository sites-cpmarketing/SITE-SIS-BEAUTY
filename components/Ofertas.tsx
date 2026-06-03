"use client";

import { useState } from "react";
import Image from "next/image";
import { OFERTAS, brl, IMG, type Oferta } from "@/lib/produtos";

type FreteOpcao = {
  id: number;
  nome: string;
  empresa: string;
  preco: number;
  prazo: number;
  erro?: string;
};

export default function Ofertas() {
  const [sel, setSel] = useState<Oferta>(OFERTAS[2]);
  const [aberto, setAberto] = useState(false); // painel abre ao escolher um plano
  const [qtdGoma, setQtdGoma] = useState(0);
  const [qtdCapsula, setQtdCapsula] = useState(0);
  const [cep, setCep] = useState("");
  const [fretes, setFretes] = useState<FreteOpcao[]>([]);
  const [freteSel, setFreteSel] = useState<FreteOpcao | null>(null);
  const [freteLoad, setFreteLoad] = useState(false);
  const [freteErro, setFreteErro] = useState("");
  const [checkoutLoad, setCheckoutLoad] = useState(false);
  const [checkoutErro, setCheckoutErro] = useState("");

  const soma = qtdGoma + qtdCapsula;
  const escolhaFeita = soma === sel.unidades && sel.unidades > 0;
  const podeAdicionar = soma < sel.unidades;

  function resetEscolhas() {
    setQtdGoma(0);
    setQtdCapsula(0);
    setCep("");
    setFretes([]);
    setFreteSel(null);
    setFreteErro("");
    setCheckoutErro("");
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

  async function calcularFrete() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setFreteErro("Digite um CEP válido (8 dígitos).");
      return;
    }
    setFreteLoad(true);
    setFreteErro("");
    setFretes([]);
    setFreteSel(null);
    try {
      const r = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: cepLimpo, unidades: sel.unidades }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Falha ao calcular frete.");
      const ok = (data.opcoes as FreteOpcao[]).filter((o) => !o.erro);
      if (ok.length === 0)
        throw new Error("Nenhuma opção de frete para este CEP.");
      setFretes(ok);
      setFreteSel(ok[0]);
    } catch (e) {
      setFreteErro(e instanceof Error ? e.message : "Erro ao calcular o frete.");
    } finally {
      setFreteLoad(false);
    }
  }

  // Frete grátis: a integração com o Melhor Envio continua ativa (calcula o
  // prazo e define o serviço usado na etiqueta), mas o cliente NÃO paga frete.
  const total = sel.precoPor;
  const podeFinalizar = escolhaFeita && !!freteSel && !checkoutLoad;

  async function finalizar() {
    if (!freteSel || !escolhaFeita) return;
    setCheckoutLoad(true);
    setCheckoutErro("");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ofertaId: sel.id,
          descricao: descricaoEscolha(),
          qtdGoma,
          qtdCapsula,
          precoProduto: sel.precoPor,
          frete: {
            servico: freteSel.nome,
            empresa: freteSel.empresa,
            preco: freteSel.preco, // custo real p/ a etiqueta — o cliente não paga (frete grátis)
            prazo: freteSel.prazo,
            servicoId: freteSel.id,
          },
          cep: cep.replace(/\D/g, ""),
          total,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.init_point)
        throw new Error(data?.error || "Não foi possível iniciar o pagamento.");
      window.location.href = data.init_point;
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
        <div className="text-center mb-10 md:mb-14">
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
        </div>

        {/* Cards das ofertas */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {OFERTAS.map((o) => {
            const ativo = aberto && sel.id === o.id;
            const desconto = Math.round(
              ((o.precoDe - o.precoPor) / o.precoDe) * 100
            );
            return (
              <div
                key={o.id}
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

                {/* PASSO 2 — frete (só após completar o kit) */}
                {escolhaFeita && (
                  <div className="fade-up">
                    <Passo
                      n={2}
                      titulo="Informe seu CEP e veja o prazo (frete grátis)"
                      feito={!!freteSel}
                    >
                      <div className="flex gap-2">
                        <input
                          inputMode="numeric"
                          placeholder="Seu CEP"
                          value={cep}
                          onChange={(e) => setCep(e.target.value)}
                          maxLength={9}
                          className="flex-1 rounded-xl border-2 border-rose-light bg-white px-4 py-3 outline-none focus:border-rose"
                        />
                        <button
                          onClick={calcularFrete}
                          disabled={freteLoad}
                          className="rounded-xl bg-cacau px-5 py-3 font-semibold text-white disabled:opacity-60"
                        >
                          {freteLoad ? "..." : "Calcular"}
                        </button>
                      </div>
                      {freteErro && (
                        <p className="mt-2 text-sm text-red-600">{freteErro}</p>
                      )}
                      {fretes.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {fretes.map((f) => (
                            <label
                              key={f.id}
                              className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors ${
                                freteSel?.id === f.id
                                  ? "border-rose bg-rose-light"
                                  : "border-rose-light"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="frete"
                                  checked={freteSel?.id === f.id}
                                  onChange={() => setFreteSel(f)}
                                  className="accent-rose"
                                />
                                <div>
                                  <p className="text-sm font-semibold">{f.nome}</p>
                                  <p className="text-xs text-cacau-soft">
                                    até {f.prazo} dias úteis
                                  </p>
                                </div>
                              </div>
                              <span className="flex items-center gap-2 font-semibold text-emerald-600">
                                <span className="text-xs text-cacau-soft line-through">
                                  {brl(f.preco)}
                                </span>
                                Grátis
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
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

                <div className="space-y-2 text-sm border-t border-rose-light pt-4">
                  <Row label="Produto" value={brl(sel.precoPor)} />
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
                      : !freteSel
                        ? "Calcule o frete para continuar"
                        : "🔒 Comprar agora"}
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
