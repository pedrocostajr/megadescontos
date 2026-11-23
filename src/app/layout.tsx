import type { Metadata } from "next";
// Fontes empacotadas no projeto: o build não depende de baixar nada do Google Fonts.
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/format";

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
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
