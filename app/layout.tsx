import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import UiEnhancements from "@/components/UiEnhancements";
import Analytics from "@/components/Analytics";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = process.env.APP_URL || "https://sisbeauty.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SIS Beauty | Cabelos Mais Fortes, Longos e Saudáveis",
  description:
    "Tratamento capilar SIS Beauty: gomas e cápsulas com fórmula avançada para acelerar o crescimento, fortalecer e dar mais brilho aos seus cabelos.",
  keywords: [
    "crescimento capilar",
    "vitaminas para cabelo",
    "goma capilar",
    "cápsula para cabelo",
    "SIS Beauty",
    "queda de cabelo",
  ],
  openGraph: {
    title: "SIS Beauty | Cabelos Mais Fortes, Longos e Saudáveis",
    description:
      "Fórmula avançada em goma e cápsula para acelerar o crescimento e fortalecer seus cabelos.",
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "SIS Beauty",
    images: [
      {
        url: "/og-sisbeauty.jpg",
        width: 1200,
        height: 630,
        alt: "SIS Beauty — tratamento capilar em goma e cápsula",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIS Beauty | Cabelos Mais Fortes, Longos e Saudáveis",
    description:
      "Fórmula avançada em goma e cápsula para acelerar o crescimento e fortalecer seus cabelos.",
    images: ["/og-sisbeauty.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        {/* Sem JS, o conteúdo com animação de scroll continua visível */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col bg-perola text-cacau">
        {children}
        <UiEnhancements />
        <Analytics />
      </body>
    </html>
  );
}
