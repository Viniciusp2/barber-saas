import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Fraunces,
  Space_Grotesk,
  Orbitron,
  Rajdhani,
  Quicksand,
} from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Tema "Moderno": títulos em geométrica minimalista.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Tema "Neon": títulos estilo cyberpunk/tech + corpo de texto condizente.
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Tema "Pastel": títulos arredondados e amigáveis.
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Barber SaaS",
  description: "Agendamento online e gestão completa para barbearias",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${spaceGrotesk.variable} ${orbitron.variable} ${rajdhani.variable} ${quicksand.variable}`}
    >
      <body className="antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('barber-saas-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
