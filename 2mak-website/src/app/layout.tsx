import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "2MaK — Precyzja w każdym wymiarze",
  description:
    "Projektowanie CAD, druk 3D i budowa maszyn. Interaktywna prezentacja usług inżynieryjnych 2MaK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${inter.variable} ${robotoMono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
