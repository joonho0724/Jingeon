import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Layout/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryProvider } from "@/components/Providers/ReactQueryProvider";

export const metadata: Metadata = {
  // title: "진건초_2026 서귀포 칠십리 유소년 축구 페스티벌",
  title: "Festival",
  description: "유소년 축구팀 대회 일정 및 결과 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning>
        <ReactQueryProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
