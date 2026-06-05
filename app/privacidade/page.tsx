import type { Metadata } from "next";
import LegalLayout, { AvisoModelo } from "@/components/LegalLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade | SIS Beauty",
  description:
    "Como a SIS Beauty coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.",
  robots: { index: true, follow: true },
};

export default function Privacidade() {
  return (
    <LegalLayout titulo="Política de Privacidade" atualizado="Junho de 2026">
      <p>
        Esta Política descreve como a <strong>{SITE.empresa.razaoSocial}</strong>{" "}
        ({SITE.empresa.documento}) trata os seus dados pessoais, em conformidade
        com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <h2>1. Dados que coletamos</h2>
      <p>Para processar sua compra e entrega, coletamos:</p>
      <ul>
        <li>Nome completo, CPF, e-mail e telefone;</li>
        <li>Endereço de entrega (CEP, rua, número, bairro, cidade e estado);</li>
        <li>
          Dados de navegação e de uso do site (via cookies e ferramentas de
          análise), de forma anônima ou pseudonimizada.
        </li>
      </ul>

      <h2>2. Como usamos seus dados</h2>
      <ul>
        <li>Processar pagamentos e confirmar pedidos;</li>
        <li>Emitir a etiqueta de envio e entregar o produto;</li>
        <li>Enviar confirmações e comunicações sobre o seu pedido;</li>
        <li>Melhorar nossa loja e mensurar campanhas de marketing.</li>
      </ul>

      <h2>3. Compartilhamento com terceiros</h2>
      <p>
        Compartilhamos apenas o necessário com parceiros que viabilizam a compra:
      </p>
      <ul>
        <li>
          <strong>Mercado Pago</strong> — processamento de pagamento;
        </li>
        <li>
          <strong>Melhor Envio / Correios</strong> e transportadoras — entrega do
          pedido;
        </li>
        <li>
          Ferramentas de análise e anúncios (ex.: Google e Meta), conforme as
          políticas de cada plataforma.
        </li>
      </ul>

      <h2>4. Cookies</h2>
      <p>
        Utilizamos cookies para o funcionamento do site e para mensurar o
        desempenho de campanhas. Você pode gerenciar os cookies nas configurações
        do seu navegador.
      </p>

      <h2>5. Seus direitos (LGPD)</h2>
      <p>
        Você pode solicitar a qualquer momento: confirmação e acesso aos seus
        dados, correção, anonimização, portabilidade, eliminação e informações
        sobre compartilhamento. Para exercer seus direitos, escreva para{" "}
        <a href={`mailto:${SITE.contato.email}`}>{SITE.contato.email}</a>.
      </p>

      <h2>6. Segurança e retenção</h2>
      <p>
        Adotamos medidas para proteger seus dados e os mantemos apenas pelo tempo
        necessário ao cumprimento das finalidades acima e de obrigações legais.
      </p>

      <h2>7. Contato</h2>
      <p>
        Dúvidas sobre esta Política?{" "}
        <a href={`mailto:${SITE.contato.email}`}>{SITE.contato.email}</a>.
      </p>

      <AvisoModelo />
    </LegalLayout>
  );
}
