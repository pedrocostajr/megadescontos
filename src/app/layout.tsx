import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/format";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", weight: ["500", "700", "800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", weight: ["500", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Mega Descontos Serra · Descontos em Gramado, Canela e Serra Gaúcha", template: "%s · Mega Descontos Serra" },
  description: "Passaporte anual com 10% a 30% de desconto em restaurantes, pousadas, cafés, vinícolas e passeios da Serra Gaúcha. Use quantas vezes quiser.",
  openGraph: { type: "website", locale: "pt_BR", siteName: "Mega Descontos Serra", images: ["/img/canela.jpg"] },
  icons: { icon: "/img/logo-mega.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable}`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
