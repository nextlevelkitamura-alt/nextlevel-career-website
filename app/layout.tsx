import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
// export const runtime = 'edge';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://nextlevel-career.vercel.app'),
  title: {
    default: "ネクストレベルキャリア | あなたのキャリアを次のレベルへ",
    template: "%s | ネクストレベルキャリア",
  },
  description: "最適な転職をサポートするパートナー、ネクストレベルキャリア。あなたのスキルと経験を最大限に活かせる企業をご紹介します。",
  openGraph: {
    title: "ネクストレベルキャリア | あなたのキャリアを次のレベルへ",
    description: "最適な転職をサポートするパートナー、ネクストレベルキャリア。",
    url: '/',
    siteName: 'ネクストレベルキャリア',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ネクストレベルキャリア | あなたのキャリアを次のレベルへ",
    description: "最適な転職をサポートするパートナー、ネクストレベルキャリア。",
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
      <body>
        <GoogleAnalytics />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
