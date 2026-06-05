import Link from "next/link";
import TrackPurchase from "@/components/TrackPurchase";

export default async function Obrigado({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const pendente = status === "pendente";

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-20">
      {/* Conversão registrada apenas quando o pagamento foi confirmado */}
      {!pendente && <TrackPurchase />}
      <div className="max-w-lg rounded-3xl border border-rose-light bg-perola p-10 text-center shadow-soft">
        <span className="text-6xl">{pendente ? "⏳" : "💜"}</span>
        <h1 className="mt-5 text-3xl md:text-4xl">
          {pendente ? "Pagamento em processamento" : "Pedido confirmado!"}
        </h1>
        <p className="mt-4 text-cacau-soft">
          {pendente
            ? "Assim que o pagamento for aprovado, você receberá a confirmação e prepararemos o seu envio. Fique de olho no seu e-mail e WhatsApp."
            : "Que alegria ter você com a gente! Seu pedido foi recebido e já estamos preparando tudo com muito carinho. Você receberá os dados de rastreio em breve."}
        </p>
        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="btn-primary inline-block rounded-full px-8 py-3.5 font-semibold"
          >
            Voltar para a loja
          </Link>
          <p className="text-xs text-cacau-soft">
            Dúvidas? Fale com a gente no WhatsApp.
          </p>
        </div>
      </div>
    </main>
  );
}
