import Image from "next/image";
import Ofertas from "@/components/Ofertas";
import { IMG } from "@/lib/produtos";
import {
  IcoBroto,
  IcoEscudo,
  IcoFolha,
  IcoBrilho,
  IcoGema,
  IcoCapsula,
} from "@/components/icons";

/* ===========================================================
   CONTATOS — TROQUE pelos seus dados reais
   =========================================================== */
const WHATSAPP = "5562994528264"; // (62) 9 9452-8264
const INSTAGRAM = "https://instagram.com/sisbeauty";
const EMAIL = "contato@sisbeauty.com.br";
const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  "Olá! Quero saber mais sobre o tratamento SIS Beauty 💜"
)}`;

export default function Home() {
  return (
    <>
      <BarraFreteGratis />
      <Header />
      <main>
        <Hero />
        <FaixaBeneficios />
        <Embaixadora />
        <ComoFunciona />
        <BeneficiosDetalhados />
        <Formula />
        <Resultados />
        <Ofertas />
        <Depoimentos />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}

/* ----------------------- Barra de frete grátis ----------------------- */
function BarraFreteGratis() {
  return (
    <div className="bg-rose text-white">
      <p className="mx-auto max-w-6xl px-4 py-2 text-center text-xs font-semibold tracking-wide md:text-sm">
        🚚 FRETE GRÁTIS para todo o Brasil • Pague em até 12x no cartão
      </p>
    </div>
  );
}

/* ----------------------- Header ----------------------- */
function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-rose-light/60 bg-perola/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#" className="font-[var(--font-display)] text-xl md:text-2xl font-bold tracking-tight">
          SIS<span className="text-rose"> Beauty</span>
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
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
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
              className="btn-primary rounded-full px-8 py-4 text-lg font-bold"
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

        <div className="relative fade-up">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] shadow-soft">
            <Image
              src={IMG.heroCabelo}
              alt="Mulher com cabelos longos e saudáveis segurando o produto SIS Beauty"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top"
            />
          </div>
          {/* Mockups flutuando */}
          <div className="absolute -bottom-3 left-0 h-20 w-20 drop-shadow-xl md:-bottom-4 md:-left-2 md:h-36 md:w-36">
            <Image src={IMG.mockupGoma} alt="Goma SIS Beauty" fill className="object-contain" />
          </div>
          <div className="absolute right-0 top-3 h-16 w-16 drop-shadow-xl md:-right-2 md:top-6 md:h-32 md:w-32">
            <Image src={IMG.mockupCapsula} alt="Cápsula SIS Beauty" fill className="object-contain" />
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
        {itens.map(({ Ico, t }) => (
          <div key={t} className="flex flex-col items-center gap-3 text-center">
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
        <div className="relative order-2 mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] shadow-soft md:order-1">
          <Image
            src={IMG.embaixadora}
            alt="Embaixadora SIS Beauty apresentando o produto"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover object-top"
          />
        </div>
        <div className="order-1 md:order-2">
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
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
          Dois formatos, um só objetivo
        </p>
        <h2 className="mt-3 text-3xl md:text-4xl">Escolha como quer se cuidar</h2>
        <p className="mx-auto mt-4 max-w-2xl text-cacau-soft">
          Goma ou cápsula? Você decide. E quando usa os dois juntos, o resultado
          é ainda mais completo, porque eles agem em sinergia pelos seus fios.
        </p>
        <div className="mt-12 grid gap-7 md:grid-cols-2">
          {produtos.map((p) => (
            <div
              key={p.tipo}
              className="flex flex-col items-center rounded-3xl border border-rose-light bg-perola p-8 shadow-soft"
            >
              <div className="relative h-56 w-44">
                <Image src={p.img} alt={`${p.nome} ${p.tipo}`} fill className="object-contain" />
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
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
            O que o tratamento faz por você
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">Resultados que você vê e sente</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {b.map(({ Ico, t, d }) => (
            <div key={t} className="rounded-2xl bg-perola p-6 shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-light/40 text-champagne">
                <Ico className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-xl">{t}</h3>
              <p className="mt-2 text-sm text-cacau-soft">{d}</p>
            </div>
          ))}
        </div>
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
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <Image src={IMG.mockupCapsula} alt="Fórmula SIS Beauty" fill className="object-contain" />
        </div>
        <div>
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

/* ----------------------- Resultados (antes e depois) ----------------------- */
function Resultados() {
  const antesDepois = [
    {
      img: IMG.resultadoEntrada,
      w: 1540,
      h: 1027,
      legenda: "Falhas na entrada preenchidas em 3 meses e meio de uso.",
    },
    {
      img: IMG.resultadoVolume,
      w: 1540,
      h: 1027,
      legenda:
        "Crescimento visível, fios mais fortes, saudáveis e muito mais volume em 4 meses e meio.",
    },
    {
      img: IMG.resultadoCrescimento,
      w: 1180,
      h: 1020,
      legenda: "Cerca de 4 cm de crescimento em menos de 2 meses.",
    },
  ];
  return (
    <section id="resultados" className="bg-cream py-14 px-4 md:py-20 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
            Antes e depois
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">Resultados reais de quem usa</h2>
          <p className="mx-auto mt-4 max-w-2xl text-cacau-soft">
            Clientes que mantiveram o tratamento e viram a diferença nos
            próprios fios — menos queda, mais volume e crescimento visível.
          </p>
        </div>

        {/* Conversa real de cliente */}
        <div className="mt-12 grid items-center gap-8 rounded-3xl bg-perola p-6 shadow-soft md:grid-cols-[auto,1fr] md:p-10">
          <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-2xl shadow-soft">
            <Image
              src={IMG.resultadoBia}
              alt="Conversa real de cliente relatando menos queda e mais volume em 49 dias"
              width={824}
              height={1740}
              sizes="(max-width: 768px) 80vw, 260px"
              className="h-auto w-full"
            />
          </div>
          <div>
            <div className="text-lg text-champagne">★★★★★</div>
            <p className="mt-3 text-xl leading-relaxed text-cacau md:text-2xl">
              &ldquo;49 dias usando e meu cabelo mudou bastante! Menos queda e
              bem mais volume.&rdquo;
            </p>
            <p className="mt-4 text-sm font-semibold text-rose">
              — Bia, cliente SIS Beauty · 49 dias de uso
            </p>
            <p className="mt-2 text-sm text-cacau-soft">
              Resultado registrado pela própria cliente, comparando antes e
              depois em pouco mais de um mês e meio.
            </p>
          </div>
        </div>

        {/* Antes e depois */}
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {antesDepois.map((r) => (
            <figure
              key={r.img}
              className="overflow-hidden rounded-3xl bg-perola shadow-soft"
            >
              <Image
                src={r.img}
                alt="Antes e depois do tratamento SIS Beauty"
                width={r.w}
                height={r.h}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="h-auto w-full"
              />
              <figcaption className="px-5 py-4 text-sm text-cacau-soft">
                {r.legenda}
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-cacau-soft">
          Resultados reais com o uso contínuo da fórmula. Cada organismo reage
          de uma forma e os resultados podem variar de pessoa para pessoa.
        </p>
      </div>
    </section>
  );
}

/* ----------------------- Depoimentos ----------------------- */
function Depoimentos() {
  // SUBSTITUA por depoimentos REAIS de clientes (com autorização de uso de imagem/texto).
  const deps = [
    { n: "Mariana S.", t: "Em poucas semanas senti meu cabelo mais forte e com menos queda no travesseiro. Apaixonada!" },
    { n: "Patrícia L.", t: "As gomas são uma delícia e super práticas. Não esqueço de tomar e já vejo diferença no brilho." },
    { n: "Carla M.", t: "Minhas unhas pararam de descascar e o cabelo cresceu mais rápido. Recomendo demais!" },
  ];
  return (
    <section className="bg-cream py-14 px-4 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
            Quem usa, ama
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">Histórias de transformação</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {deps.map((d) => (
            <div key={d.n} className="rounded-2xl bg-perola p-7 shadow-soft">
              <div className="text-champagne">★★★★★</div>
              <p className="mt-3 text-cacau">&ldquo;{d.t}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-rose">{d.n}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-cacau-soft">
          Depoimentos reais de clientes. Resultados podem variar de pessoa para pessoa.
        </p>
      </div>
    </section>
  );
}

/* ----------------------- FAQ (nativo, sem JS) ----------------------- */
function FAQ() {
  const faqs = [
    { q: "Em quanto tempo vejo resultados?", a: "Os primeiros sinais costumam aparecer entre 4 e 8 semanas de uso contínuo. Para o resultado completo, recomendamos o tratamento de 4 meses, que garante a nutrição constante dos fios." },
    { q: "Devo escolher goma ou cápsula?", a: "Os dois têm o mesmo objetivo. A goma é mais prática e saborosa; a cápsula é mais concentrada. Muitas clientes usam os dois juntos para potencializar os resultados, e por isso o kit completo permite montar como você preferir." },
    { q: "Como devo tomar?", a: "Siga sempre a orientação do rótulo. De forma geral, o uso é diário e pode ser feito no horário que for mais fácil de manter na sua rotina." },
    { q: "Tem contraindicação?", a: "Por ser um suplemento alimentar, é seguro para a maioria das pessoas. Gestantes, lactantes, menores de 18 anos ou pessoas com condições de saúde específicas devem consultar um profissional antes de usar." },
    { q: "O frete é grátis mesmo?", a: "Sim! O frete é grátis para todo o Brasil, sem valor mínimo de compra. Você paga apenas pelo tratamento — o envio é por nossa conta." },
    { q: "Qual o prazo de entrega?", a: "Enviamos para todo o Brasil com frete grátis. Basta informar o seu CEP no checkout para ver o prazo estimado de entrega da sua região." },
  ];
  return (
    <section id="faq" className="py-14 px-4 md:py-20 scroll-mt-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
            Dúvidas frequentes
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">Tudo o que você precisa saber</h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
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
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-5xl">
          Seus cabelos dos sonhos começam hoje
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cacau-soft">
          Junte-se às mulheres que escolheram cuidar dos cabelos de verdade e
          transformaram a saúde dos seus fios.
        </p>
        <a
          href="#ofertas"
          className="btn-primary mt-8 inline-block rounded-full px-10 py-5 text-xl font-bold"
        >
          Quero começar meu tratamento
        </a>
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
          <p className="font-[var(--font-display)] text-2xl font-bold">
            SIS<span className="text-rose"> Beauty</span>
          </p>
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
          <p className="font-semibold">Contato</p>
          <ul className="mt-3 space-y-2 text-cacau-soft">
            <li><a href={waLink} className="hover:text-rose">WhatsApp</a></li>
            <li><a href={INSTAGRAM} className="hover:text-rose">Instagram</a></li>
            <li><a href={`mailto:${EMAIL}`} className="hover:text-rose">{EMAIL}</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-rose-light pt-6 text-center text-xs text-cacau-soft">
        <p>© {new Date().getFullYear()} SIS Beauty. Todos os direitos reservados.</p>
        <p className="mt-2">
          Este produto é um suplemento alimentar e não substitui uma alimentação
          equilibrada. Resultados podem variar.
        </p>
      </div>
    </footer>
  );
}

/* ----------------------- WhatsApp flutuante ----------------------- */
function WhatsappFloat() {
  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_30px_-6px_rgba(18,140,114,0.75)] ring-1 ring-white/40 transition-transform duration-200 hover:scale-110"
      style={{ background: "linear-gradient(145deg, #25D366 0%, #0e8a72 100%)" }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
        <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15h-.004a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
      </svg>
    </a>
  );
}
