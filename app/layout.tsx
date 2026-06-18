import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mundial 2026 · IA Predictor",
  description:
    "Asi predice la IA el Mundial 2026: modelo Poisson y 10.000 simulaciones Monte Carlo sobre los 72 partidos y 48 selecciones.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen">
        <div className="grid-bg min-h-screen">
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-ink-800 py-6 text-center">
            <p className="label">
              Analisis estadistico de entretenimiento. No es asesoria de
              apuestas.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
