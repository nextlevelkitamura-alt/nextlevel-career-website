import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next Level Career | あなたのキャリアを次のレベルへ",
  description: "最適な転職をサポートするパートナー、Next Level Career。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
