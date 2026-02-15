import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { MobileActionBar } from "@/components/MobileActionBar";
import { baseMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = baseMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.locale}>
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.shortName,
            url: site.url,
            description: site.description,
          }}
        />
        <Header />
        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
        <Footer />
        <MobileActionBar />
      </body>
    </html>
  );
}
