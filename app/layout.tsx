import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://nextlevel-career.vercel.app'),
  title: {
    default: "ネクストレベル キャリア | あなたのキャリアを次のレベルへ",
    template: "%s | ネクストレベル キャリア",
  },
  description: "最適な転職をサポートするパートナー、ネクストレベル キャリア。あなたのスキルと経験を最大限に活かせる企業をご紹介します。",
  openGraph: {
    title: "ネクストレベル キャリア | あなたのキャリアを次のレベルへ",
    description: "最適な転職をサポートするパートナー、ネクストレベル キャリア。",
    url: '/',
    siteName: 'ネクストレベル キャリア',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ネクストレベル キャリア | あなたのキャリアを次のレベルへ",
    description: "最適な転職をサポートするパートナー、ネクストレベル キャリア。",
  },
  verification: {
    google: "oSBMBkWM-Bt4lSG8g6Fh_OzS3FIGaOLYCp9fV5ywoAc",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

