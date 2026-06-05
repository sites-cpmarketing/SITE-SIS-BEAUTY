import type { Metadata } from "next";
import LegalLayout, { AvisoModelo } from "@/components/LegalLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trocas e Devoluções | SIS Beauty",
  description:
    "Política de trocas, devoluções e direito de arrependimento da SIS Beauty, conforme o Código de Defesa do Consumidor.",
  robots: { index: true, follow: true },
};

export default function Trocas() {
  return (
    <LegalLayout titulo="Trocas e Devoluções" atualizado="Junho de 2026">
      <p>
        Queremos que você fique satisfeita com a sua compra. Veja abaixo as
        condições de troca e devolução, conforme o Código de Defesa do Consumidor
        (Lei nº 8.078/1990).
      </p>

      <h2>1. Direito de arrependimento (7 dias)</h2>
      <p>
        Por se tratar de compra à distância, você pode desistir do pedido em até{" "}
        <strong>7 dias corridos</strong> após o recebimento (art. 49 do CDC).
        Para isso, o produto deve estar <strong>lacrado e sem violação</strong>,
        nas mesmas condições em que foi entregue. Por serem suplementos
        alimentares (produtos de ingestão), itens com o lacre rompido não podem
        ser devolvidos por questões de higiene e segurança, exceto em caso de
        defeito.
      </p>

      <h2>2. Produto com defeito ou avaria</h2>
      <p>
        Se o produto chegar com defeito, avariado ou divergente do pedido, entre
        em contato em até <strong>7 dias</strong> após o recebimento com fotos do
        item e da embalagem. Faremos a troca ou o reembolso, sem custo para você.
      </p>

      <h2>3. Como solicitar</h2>
      <ul>
        <li>
          Escreva para{" "}
          <a href={`mailto:${SITE.contato.email}`}>{SITE.contato.email}</a> ou
          chame no WhatsApp {SITE.contato.whatsappDisplay};
        </li>
        <li>Informe o número do pedido e o motivo;</li>
        <li>Aguarde as instruções para o envio de retorno.</li>
      </ul>

      <h2>4. Reembolso</h2>
      <p>
        Após recebermos e conferirmos o produto, o reembolso é processado pelo
        mesmo meio de pagamento. O prazo de estorno segue as regras do Mercado
        Pago e da operadora do cartão (geralmente em até uma ou duas faturas).
      </p>

      <h2>5. Contato</h2>
      <p>
        Precisa de ajuda?{" "}
        <a href={`mailto:${SITE.contato.email}`}>{SITE.contato.email}</a>.
      </p>

      <AvisoModelo />
    </LegalLayout>
  );
}
