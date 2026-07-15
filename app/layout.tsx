import "./globals.css";
import "./brand.css";
import "./editorial.css";
import "./publication.css";
import "./refine.css";
import type { Metadata } from "next";
import { baseMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
export const metadata:Metadata=baseMetadata();
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang={site.locale}><body>{children}</body></html>}
