import type { Metadata } from "next";
import LegalLayout, { AvisoModelo } from "@/components/LegalLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de Uso | SIS Beauty",
  description:
    "Condições de uso da loja SIS Beauty: produtos, pagamento, entrega e responsabilidades.",
  robots: { index: true, follow: true },
};

export default function Termos() {
  return (
    <LegalLayout titulo="Termos de Uso" atualizado="Junho de 2026">
      <p>
        Ao navegar e comprar em nossa loja, você concorda com estes Termos. A
        venda é realizada por <strong>{SITE.empresa.razaoSocial}</strong> (
        {SITE.empresa.documento}).
      </p>

      <h2>1. Produtos</h2>
      <p>
        Os produtos SIS Beauty são <strong>suplementos alimentares</strong> e
        não são medicamentos. Não substituem uma alimentação equilibrada nem
        tratamento médico. Gestantes, lactantes, menores de 18 anos e pessoas com
        condições de saúde específicas devem consultar um profissional antes do
        uso. Resultados podem variar de pessoa para pessoa.
      </p>

      <h2>2. Preços e pagamento</h2>
      <p>
        Os preços são exibidos em reais (BRL) e podem ser alterados sem aviso
        prévio. O pagamento é processado pelo <strong>Mercado Pago</strong>, com
        opções de Pix, cartão de crédito ou boleto. O pedido é confirmado após a
        aprovação do pagamento.
      </p>

      <h2>3. Entrega</h2>
      <p>
        Enviamos para todo o Brasil com <strong>frete grátis</strong>. O prazo de
        entrega depende da região e da transportadora (Correios e parceiros), e é
        estimado a partir do CEP informado. A responsabilidade pela entrega no
        prazo é da transportadora; eventuais atrasos serão acompanhados por nós.
      </p>

      <h2>4. Trocas e devoluções</h2>
      <p>
        As condições de troca, devolução e direito de arrependimento estão
        descritas na nossa página de{" "}
        <a href="/trocas">Trocas e Devoluções</a>.
      </p>

      <h2>5. Propriedade intelectual</h2>
      <p>
        Marca, textos, imagens e demais conteúdos deste site pertencem à SIS
        Beauty e não podem ser reproduzidos sem autorização.
      </p>

      <h2>6. Contato</h2>
      <p>
        Fale com a gente em{" "}
        <a href={`mailto:${SITE.contato.email}`}>{SITE.contato.email}</a> ou pelo
        WhatsApp {SITE.contato.whatsappDisplay}.
      </p>

      <AvisoModelo />
    </LegalLayout>
  );
}
