import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { AppNavigation } from "@/components/app-navigation";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ascend Gamer Lab",
  description: "Coach gamer pessoal para evolução competitiva.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-zinc-950 antialiased`}
      >
        <AppNavigation />

        <div className="xl:pl-72">{children}</div>

        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}