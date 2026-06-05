import { SITE } from "@/lib/site";
import { OFERTAS } from "@/lib/produtos";

/** Dados estruturados (schema.org) para SEO e rich results no Google. */
export default function JsonLd() {
  const precos = OFERTAS.map((o) => o.precoPor);
  const low = Math.min(...precos);
  const high = Math.max(...precos);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.nome,
    url: SITE.dominio,
    email: SITE.contato.email,
    logo: `${SITE.dominio}/og-sisbeauty.jpg`,
    sameAs: [SITE.contato.instagram],
  };

  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "SIS Beauty — Tratamento Capilar (Goma & Cápsula)",
    description: SITE.descricao,
    brand: { "@type": "Brand", name: SITE.nome },
    image: [`${SITE.dominio}/og-sisbeauty.jpg`],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      lowPrice: low,
      highPrice: high,
      offerCount: OFERTAS.length,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
      />
    </>
  );
}
