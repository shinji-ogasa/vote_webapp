import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FACE CHECK — 顔面投票",
  description: "QRコードから開いて、今日の顔面に一票。",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
