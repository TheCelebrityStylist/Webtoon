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
      <body className="appBody">
        <Header />
        <main className="container main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
