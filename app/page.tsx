import Image from "next/image";
import Link from "next/link";
import Ofertas from "@/components/Ofertas";
import CarrosselResultados from "@/components/CarrosselResultados";
import { IMG } from "@/lib/produtos";
import { SITE, waLink } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import Logo from "@/components/Logo";
import {
  IcoBroto,
  IcoEscudo,
  IcoFolha,
  IcoBrilho,
  IcoGema,
  IcoCapsula,
} from "@/components/icons";

const INSTAGRAM = SITE.contato.instagram;
const EMAIL = SITE.contato.email;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ pagamento?: string }>;
}) {
  const { pagamento } = await searchParams;
  return (
    <>
      <JsonLd />
      <BarraFreteGratis />
      <Header />
      {pagamento === "falhou" && <BannerPagamentoFalhou />}
      <main>
        <Hero />
        <FaixaBeneficios />
        <Embaixadora />
        <ComoFunciona />
        <BeneficiosDetalhados />
        <Formula />
        <Resultados />
        <Ofertas />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}

/* ----------------------- Banner: pagamento recusado ----------------------- */
function BannerPagamentoFalhou() {
  return (
    <div className="bg-red-50 px-4 py-3 text-center text-sm text-red-700">
      Seu pagamento não foi concluído. Nenhuma cobrança foi feita —{" "}
      <a href="#ofertas" className="font-semibold underline">
        tente novamente
      </a>{" "}
      ou{" "}
      <a href={waLink("Olá! Tive um problema no pagamento do site.")} className="font-semibold underline">
        fale conosco
      </a>
      .
    </div>
  );
}

/* ----------------------- Barra de frete grátis (banner rolando) ----------------------- */
function BarraFreteGratis() {
  const item = (
    <span className="mx-6 inline-flex items-center gap-2 text-xs font-semibold tracking-wide md:text-sm">
      🚚 FRETE GRÁTIS para todo o Brasil
    </span>
  );
  return (
    <div className="overflow-hidden bg-rose py-2 text-white">
      {/* Mensagem única para leitores de tela (o marquee é decorativo) */}
      <span className="sr-only">Frete grátis para todo o Brasil.</span>
      <div
        className="flex w-max animate-marquee whitespace-nowrap"
        aria-hidden="true"
      >
        {/* Conteúdo duplicado para o loop ficar contínuo */}
        <div className="flex shrink-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={`a-${i}`}>{item}</span>
          ))}
        </div>
        <div className="flex shrink-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={`b-${i}`}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Header ----------------------- */
function Header() {
  return (
    <header data-header className="sticky top-0 z-40 border-b border-rose-light/60 bg-perola/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#" aria-label="SIS Beauty — página inicial">
          <Logo size="md" priority />
        </a>
        <nav className="hidden gap-7 text-sm font-medium text-cacau-soft md:flex">
          <a href="#como-funciona" className="hover:text-rose">Como funciona</a>
          <a href="#beneficios" className="hover:text-rose">Benefícios</a>
          <a href="#ofertas" className="hover:text-rose">Preços</a>
          <a href="#faq" className="hover:text-rose">Dúvidas</a>
        </nav>
        <a
          href="#ofertas"
          className="btn-primary rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap"
        >
          Comprar
        </a>
      </div>
    </header>
  );
}

/* ----------------------- Hero ----------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-2 px-4 pb-0 pt-8 md:grid-cols-2 md:gap-10 md:py-20">
        <div className="fade-up">
          <span className="inline-block rounded-full bg-rose-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cacau">
            Fórmula avançada • Goma & Cápsula
          </span>
          <h1 className="mt-5 text-[2rem] leading-[1.1] md:text-6xl">
            Cabelos mais{" "}
            <span className="text-rose">fortes, longos</span> e cheios de vida
          </h1>
          <p className="mt-5 max-w-md text-base md:text-lg text-cacau-soft">
            O tratamento SIS Beauty nutre seus fios de dentro para fora,
            favorece o crescimento e reduz a quebra, com a praticidade de uma
            goma deliciosa ou da cápsula concentrada.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#ofertas"
              className="btn-primary inline-block rounded-full px-7 py-3.5 text-base font-bold sm:text-lg md:px-8 md:py-4"
            >
              Quero meus cabelos dos sonhos
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cacau-soft">
            <Mini icon="🌿" t="100% natural" />
            <Mini icon="🚚" t="Frete grátis Brasil" />
            <Mini icon="🔒" t="Compra segura" />
          </div>
        </div>

        {/* ── Moldura premium do hero ── */}
        <div className="relative fade-up flex justify-center md:justify-end">

          {/* Blob decorativo de fundo */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(ellipse, #f2d3c7 0%, #fdeee6 55%, transparent 80%)" }}
          />

          {/* Moldura externa — borda dupla com canto cortado */}
          <div className="relative w-full max-w-[300px] sm:max-w-[340px] md:max-w-[400px]">

            {/* Cantos decorativos */}
            <span aria-hidden className="pointer-events-none absolute -top-2 -left-2 h-8 w-8 rounded-tl-xl border-t-2 border-l-2 border-champagne z-10" />
            <span aria-hidden className="pointer-events-none absolute -top-2 -right-2 h-8 w-8 rounded-tr-xl border-t-2 border-r-2 border-champagne z-10" />
            <span aria-hidden className="pointer-events-none absolute -bottom-2 -left-2 h-8 w-8 rounded-bl-xl border-b-2 border-l-2 border-champagne z-10" />
            <span aria-hidden className="pointer-events-none absolute -bottom-2 -right-2 h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-champagne z-10" />

            {/* Foto dentro da moldura */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                aspectRatio: "760/1140",
                boxShadow: "0 24px 64px -16px rgba(74,51,45,0.35), 0 0 0 1px rgba(193,107,86,0.18)",
              }}
            >
              <Image
                src={IMG.heroCabelo}
                alt="SIS Beauty — Hair Growth Caps e Premium"
                fill
                priority
                quality={92}
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 400px"
                className="object-cover object-top"
              />
              {/* Gradiente sutil na base */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4"
                style={{ background: "linear-gradient(to top, rgba(43,30,26,0.25), transparent)" }}
              />
            </div>

            {/* Badge flutuante */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold tracking-widest text-white uppercase shadow-lg"
              style={{ background: "linear-gradient(135deg,#c16b56,#a44f3c)" }}
            >
              ✦ Cabelos dos Sonhos ✦
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function Mini({ icon, t }: { icon: string; t: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span>{icon}</span>
      <span>{t}</span>
    </span>
  );
}

/* ----------------------- CTA reutilizável (botão estratégico) ----------------------- */
function CtaInline({
  texto = "Quero começar meu tratamento",
  variante = "primary",
  className = "mt-10",
}: {
  texto?: string;
  variante?: "primary" | "outline";
  className?: string;
}) {
  return (
    <div className={`flex justify-center ${className}`}>
      <a
        href="#ofertas"
        className={
          variante === "primary"
            ? "btn-primary rounded-full px-6 py-3.5 text-sm font-bold sm:text-base md:px-8 md:py-4 md:text-lg"
            : "inline-block rounded-full border-2 border-rose px-6 py-3 text-sm font-semibold text-rose transition-colors hover:bg-rose hover:text-white sm:text-base md:px-7 md:py-3.5"
        }
      >
        {texto}
      </a>
    </div>
  );
}

/* ----------------------- Faixa de benefícios ----------------------- */
function FaixaBeneficios() {
  const itens = [
    { Ico: IcoBroto, t: "Acelera o crescimento" },
    { Ico: IcoEscudo, t: "Fortalece da raiz" },
    { Ico: IcoBrilho, t: "Mais brilho e maciez" },
    { Ico: IcoFolha, t: "Reduz a quebra e a queda" },
  ];
  return (
    <section className="border-y border-rose-light bg-perola">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
        {itens.map(({ Ico, t }, idx) => (
          <div
            key={t}
            data-reveal
            data-delay={(idx % 4) + 1}
            className="flex flex-col items-center gap-3 text-center"
          >
            <Ico className="h-9 w-9 text-champagne" />
            <span className="text-sm font-semibold text-cacau">{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------- Embaixadora ----------------------- */
function Embaixadora() {
  return (
    <section className="bg-cream py-14 px-4 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div
          data-reveal
          className="relative order-2 mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] shadow-soft md:order-1"
        >
          <Image
            src={IMG.embaixadora}
            alt="Embaixadora SIS Beauty apresentando o produto"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover object-top"
          />
        </div>
        <div data-reveal data-delay={1} className="order-1 md:order-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
            Por trás da SIS Beauty
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">
            Beleza que nasce do cuidado com você
          </h2>
          <p className="mt-5 text-cacau-soft">
            A SIS Beauty nasceu da vontade de oferecer um cuidado capilar de
            verdade, daqueles que tratam a causa, e não só a aparência. Cada
            fórmula foi pensada para nutrir os fios em profundidade, com
            ingredientes selecionados e a praticidade que a sua rotina pede.
          </p>
          <p className="mt-4 text-cacau-soft">
            Acreditamos que cabelo bonito é reflexo de cabelo saudável. Por isso
            unimos ciência, qualidade e carinho em cada pote.
          </p>
          <a
            href="#ofertas"
            className="mt-7 inline-block rounded-full border-2 border-rose px-7 py-3 font-semibold text-rose transition-colors hover:bg-rose hover:text-white"
          >
            Conhecer o tratamento
          </a>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- Como funciona (2 produtos) ----------------------- */
function ComoFunciona() {
  const produtos = [
    {
      img: IMG.mockupGoma,
      nome: "Hair Growth Premium",
      tipo: "Goma",
      desc: "Pastilha de goma sabor Creme de Baunilha, sem adição de açúcar. A forma mais gostosa e prática de cuidar do cabelo todos os dias.",
      pontos: ["30 gomas por pote", "Sabor creme de baunilha", "Sem adição de açúcar"],
    },
    {
      img: IMG.mockupCapsula,
      nome: "Hair Growth Caps",
      tipo: "Cápsula",
      desc: "Cápsula concentrada com fórmula avançada, fonte de vitaminas. Nutrição potente para quem quer acelerar os resultados.",
      pontos: ["60 cápsulas por pote", "Fórmula concentrada", "Fonte de vitaminas"],
    },
  ];
  return (
    <section id="como-funciona" className="py-14 px-4 md:py-20 scroll-mt-20">
      <div className="mx-auto max-w-6xl text-center">
        <p data-reveal className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
          Dois formatos, um só objetivo
        </p>
        <h2 data-reveal data-delay={1} className="mt-3 text-3xl md:text-4xl">Escolha como quer se cuidar</h2>
        <p data-reveal data-delay={2} className="mx-auto mt-4 max-w-2xl text-cacau-soft">
          Goma ou cápsula? Você decide. E quando usa os dois juntos, o resultado
          é ainda mais completo, porque eles agem em sinergia pelos seus fios.
        </p>
        <div className="mt-12 grid gap-7 md:grid-cols-2">
          {produtos.map((p, idx) => (
            <div
              key={p.tipo}
              data-reveal
              data-delay={idx + 1}
              className="card-hover flex flex-col items-center rounded-3xl border border-rose-light bg-perola p-8 shadow-soft"
            >
              <div className="relative flex h-64 w-full items-end justify-center">
                {/* Halo de luz atrás do pote */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-rose-light/70 via-champagne/20 to-transparent blur-2xl" />
                {/* Sombra projetada no chão */}
                <div className="pote-sombra pointer-events-none absolute bottom-3 left-1/2 h-4 w-32 -translate-x-1/2 rounded-[50%] bg-cacau blur-md" />
                {/* Pote em destaque */}
                <div className="relative h-56 w-44">
                  <Image
                    src={p.img}
                    alt={`${p.nome} ${p.tipo}`}
                    fill
                    quality={95}
                    sizes="(max-width: 768px) 50vw, 176px"
                    className="pote-3d object-contain"
                  />
                </div>
              </div>
              <span className="mt-2 rounded-full bg-rose-light px-3 py-1 text-xs font-bold uppercase tracking-wide text-cacau">
                {p.tipo}
              </span>
              <h3 className="mt-3 text-2xl">{p.nome}</h3>
              <p className="mt-3 text-sm text-cacau-soft">{p.desc}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {p.pontos.map((pt) => (
                  <li key={pt} className="flex items-center justify-center gap-2">
                    <span className="text-champagne">✓</span> {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <CtaInline texto="Escolher meu tratamento" className="mt-12" />
      </div>
    </section>
  );
}

/* ----------------------- Benefícios detalhados ----------------------- */
function BeneficiosDetalhados() {
  const b = [
    { Ico: IcoBroto, t: "Crescimento acelerado", d: "Estimula os folículos e favorece fios mais longos mês após mês." },
    { Ico: IcoEscudo, t: "Força da raiz às pontas", d: "Fortalece a fibra capilar e reduz a quebra no dia a dia." },
    { Ico: IcoFolha, t: "Menos queda", d: "Nutrição que ajuda a manter os fios firmes no couro cabeludo." },
    { Ico: IcoBrilho, t: "Brilho e maciez", d: "Devolve a vitalidade, o brilho saudável e o toque sedoso." },
    { Ico: IcoGema, t: "Unhas mais fortes", d: "As mesmas vitaminas que cuidam do cabelo fortalecem suas unhas." },
    { Ico: IcoCapsula, t: "Fonte de vitaminas", d: "Complexo de nutrientes essenciais para a saúde capilar." },
  ];
  return (
    <section id="beneficios" className="bg-cream py-14 px-4 md:py-20 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center" data-reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
            O que o tratamento faz por você
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">Resultados que você vê e sente</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {b.map(({ Ico, t, d }, idx) => (
            <div
              key={t}
              data-reveal
              data-delay={(idx % 3) + 1}
              className="card-hover rounded-2xl bg-perola p-6 shadow-soft"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-light/40 text-champagne">
                <Ico className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-xl">{t}</h3>
              <p className="mt-2 text-sm text-cacau-soft">{d}</p>
            </div>
          ))}
        </div>
        <CtaInline texto="Quero esses resultados" variante="outline" className="mt-12" />
      </div>
    </section>
  );
}

/* ----------------------- Fórmula ----------------------- */
function Formula() {
  const nutrientes = [
    "Biotina", "Colágeno", "Zinco", "Vitamina C", "Vitamina E",
    "Complexo B", "Ácido Fólico", "Selênio", "Vitamina A",
  ];
  return (
    <section className="py-14 px-4 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div data-reveal className="relative mx-auto aspect-square w-full max-w-md">
          <Image
            src={IMG.mockupCapsula}
            alt="Fórmula SIS Beauty"
            fill
            quality={95}
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-contain"
          />
        </div>
        <div data-reveal data-delay={1}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
            Fórmula avançada
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">
            Nutrientes que seus fios pedem
          </h2>
          <p className="mt-4 text-cacau-soft">
            Uma combinação pensada para fortalecer o cabelo de dentro para fora:
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {nutrientes.map((n) => (
              <span
                key={n}
                className="rounded-full border border-rose-light bg-perola px-4 py-2 text-sm font-medium text-cacau"
              >
                {n}
              </span>
            ))}
          </div>
          <a
            href="#ofertas"
            className="btn-primary mt-7 inline-block rounded-full px-8 py-4 text-base font-bold md:text-lg"
          >
            Quero essa fórmula no meu cabelo
          </a>
          <p className="mt-6 text-xs text-cacau-soft">
            * Confira a composição completa no rótulo do produto. Suplemento
            alimentar não substitui uma alimentação equilibrada. Consumo por
            gestantes, lactantes e crianças deve ter orientação profissional.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- Resultados (carrossel de feedbacks) ----------------------- */
function Resultados() {
  return (
    <section id="resultados" className="bg-cream py-14 px-4 md:py-20 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center" data-reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
            Antes e depois
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">Resultados reais de quem usa</h2>
          <p className="mx-auto mt-4 max-w-2xl text-cacau-soft">
            Clientes que mantiveram o tratamento e viram a diferença nos
            próprios fios — menos queda, mais volume e crescimento visível.
          </p>
        </div>

        <CarrosselResultados />

        <CtaInline texto="Quero resultados assim no meu cabelo" className="mt-10" />

        <p className="mt-8 text-center text-xs text-cacau-soft">
          Resultados reais com o uso contínuo da fórmula. Cada organismo reage
          de uma forma e os resultados podem variar de pessoa para pessoa.
        </p>
      </div>
    </section>
  );
}

/* ----------------------- FAQ (nativo, sem JS) ----------------------- */
function FAQ() {
  const faqs = [
    { q: "Em quanto tempo vejo resultados?", a: "Os primeiros sinais costumam aparecer entre 4 e 8 semanas de uso contínuo. Para o resultado completo, recomendamos o tratamento de 4 meses, que garante a nutrição constante dos fios." },
    { q: "Devo escolher goma ou cápsula?", a: "Goma ou cápsula? Você decide. E quando usa os dois juntos, os resultados são ainda mais completos, pois atuam em sinergia para fortalecer e cuidar dos seus fios." },
    { q: "Como devo tomar?", a: "Siga sempre a orientação do rótulo. De forma geral, o uso é diário e pode ser feito no horário que for mais fácil de manter na sua rotina." },
    { q: "Tem contraindicação?", a: "Por ser um suplemento alimentar, é seguro para a maioria das pessoas. Gestantes, lactantes, menores de 18 anos ou pessoas com condições de saúde específicas devem consultar um profissional antes de usar." },
    { q: "O frete é grátis mesmo?", a: "Sim! O frete é grátis para todo o Brasil, sem valor mínimo de compra. Você paga apenas pelo tratamento — o envio é por nossa conta." },
    { q: "Qual o prazo de entrega?", a: "Enviamos para todo o Brasil com frete grátis. Basta informar o seu CEP no checkout para ver o prazo estimado de entrega da sua região." },
  ];
  return (
    <section id="faq" className="py-14 px-4 md:py-20 scroll-mt-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center" data-reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
            Dúvidas frequentes
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">Tudo o que você precisa saber</h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((f, idx) => (
            <details
              key={f.q}
              data-reveal
              data-delay={(idx % 5) + 1}
              className="group rounded-2xl border border-rose-light bg-perola p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-cacau">
                {f.q}
                <span className="text-rose transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-cacau-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- CTA final ----------------------- */
function CTAFinal() {
  return (
    <section className="px-4 py-14 md:py-20">
      <div className="mx-auto max-w-4xl text-center" data-reveal>
        <h2 className="text-3xl md:text-5xl">
          Seus cabelos dos sonhos começam hoje
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cacau-soft">
          Junte-se às mulheres que escolheram cuidar dos cabelos de verdade e
          transformaram a saúde dos seus fios.
        </p>
      </div>
    </section>
  );
}

/* ----------------------- Footer ----------------------- */
function Footer() {
  return (
    <footer className="border-t border-rose-light bg-perola px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <Logo size="sm" />
          <p className="mt-3 text-sm text-cacau-soft">
            Cuidado capilar de verdade, do jeito que você merece.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Navegação</p>
          <ul className="mt-3 space-y-2 text-cacau-soft">
            <li><a href="#como-funciona" className="hover:text-rose">Como funciona</a></li>
            <li><a href="#beneficios" className="hover:text-rose">Benefícios</a></li>
            <li><a href="#ofertas" className="hover:text-rose">Preços</a></li>
            <li><a href="#faq" className="hover:text-rose">Dúvidas</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Contato &amp; Institucional</p>
          <ul className="mt-3 space-y-2 text-cacau-soft">
            <li><a href={waLink()} className="hover:text-rose">WhatsApp</a></li>
            <li><a href={INSTAGRAM} className="hover:text-rose">Instagram</a></li>
            <li><a href={`mailto:${EMAIL}`} className="hover:text-rose">{EMAIL}</a></li>
            <li><Link href="/privacidade" className="hover:text-rose">Política de Privacidade</Link></li>
            <li><Link href="/termos" className="hover:text-rose">Termos de Uso</Link></li>
            <li><Link href="/trocas" className="hover:text-rose">Trocas e Devoluções</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-rose-light pt-6 text-center text-xs text-cacau-soft">
        <p>
          {SITE.empresa.razaoSocial} · {SITE.empresa.documento}
        </p>
        <p className="mt-1">{SITE.empresa.endereco}</p>
        <p className="mt-3">
          © {new Date().getFullYear()} {SITE.nome}. Todos os direitos
          reservados.
        </p>
        <p className="mt-2">
          Este produto é um suplemento alimentar e não substitui uma alimentação
          equilibrada. Resultados podem variar de pessoa para pessoa.
        </p>
      </div>
    </footer>
  );
}

