import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = localFont({
  src: "../public/fonts/sora.woff2",
  variable: "--font-sora",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Cipher Yield - Privacy-Preserving Vault",
  description: "Non-custodial, privacy-preserving vault with automated hedging on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} ${sora.variable} antialiased bg-background text-text-primary`}>
        <div className="min-h-screen relative">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          <div className="relative z-10">
            <Header />
            <main className="max-w-7xl mx-auto px-6 py-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
