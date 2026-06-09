import Link from "next/link";
import TrackPurchase from "@/components/TrackPurchase";

/** Lê um parâmetro que pode vir repetido (o MP às vezes anexa `status` 2x). */
function primeiro(v?: string | string[]): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function Obrigado({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // O Mercado Pago anexa estes parâmetros na URL de retorno (back_urls).
  const paymentId =
    primeiro(sp.payment_id) || primeiro(sp.collection_id);

  // Junta todos os status presentes (status manual + status/collection_status do MP)
  const statuses = [sp.status, sp.collection_status]
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .filter(Boolean) as string[];

  const aprovado = statuses.includes("approved");
  const rejeitado = statuses.some((s) =>
    ["rejected", "cancelled", "failure"].includes(s)
  );
  const pendente =
    !aprovado &&
    statuses.some((s) => ["pending", "pendente", "in_process"].includes(s));

  // Só conta conversão com pagamento REAL: precisa do payment_id do MP e
  // não pode estar pendente nem rejeitado. Acesso direto a /obrigado não dispara.
  const disparaPurchase = !!paymentId && !pendente && !rejeitado;

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-20">
      {/* Conversão registrada apenas para pagamento aprovado e real */}
      {disparaPurchase && <TrackPurchase paymentId={paymentId} />}
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
