import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "ReqQuality AI — Intelligent Test Case Quality Analyzer",
  description:
    "AI-powered analysis of test cases and requirements. Detects ambiguity, hidden assumptions, and automation readiness before test implementation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
