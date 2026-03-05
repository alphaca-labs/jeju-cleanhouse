import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "제주 클린하우스 | Jeju Clean House Finder",
  description: "제주도 클린하우스 위치 검색 서비스 — Powered by Alphaca Labs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={notoSansKR.className}>{children}</body>
    </html>
  );
}
