// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { baseMetadata } from "@/lib/seo";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = baseMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.locale}>
      <body style={{ minHeight: "100vh", background: "#ffffff", color: "#111111" }}>
        <Header />
        <main style={{ maxWidth: "72rem", margin: "0 auto", padding: "40px 16px" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
