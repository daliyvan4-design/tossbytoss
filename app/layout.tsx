import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Toss by Toss — L'art du cuir, fait à Abidjan",
  description: "Maroquinerie et souliers artisanaux. Dessinés et fabriqués à Abidjan, Côte d'Ivoire.",
  openGraph: {
    title: "Toss by Toss",
    description: "L'art du cuir, fait à Abidjan.",
    siteName: "Toss by Toss",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-mode="day" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${montserrat.variable} ${jetbrains.variable}`}>
        {children}
      </body>
    </html>
  );
}
