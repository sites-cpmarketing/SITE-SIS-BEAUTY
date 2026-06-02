import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
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
      <body className="min-h-full flex flex-col bg-perola text-cacau">
        {children}
      </body>
    </html>
  );
}
