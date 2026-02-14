import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { baseMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = baseMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.locale}>
      <body>
        <Header />
        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
        <Footer />
        <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
          <Link href="/series" className="block rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg">
            Start reading free
          </Link>
        </div>
      </body>
    </html>
  );
}
