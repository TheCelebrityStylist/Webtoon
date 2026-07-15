import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/MarketingShell";
import { FeaturePage } from "@/components/FeaturePage";
import { marketingBySlug, marketingPages } from "@/lib/marketing";
import { absoluteUrl } from "@/lib/seo";
export function generateStaticParams(){return marketingPages.filter(p=>!p.slug.includes("/")).map(p=>({marketingSlug:p.slug}))}
export async function generateMetadata({params}:{params:Promise<{marketingSlug:string}>}):Promise<Metadata>{const{marketingSlug}=await params;const p=marketingBySlug.get(marketingSlug);if(!p)return{};return{title:p.title,description:p.description,alternates:{canonical:absoluteUrl(`/${p.slug}`),languages:{en:absoluteUrl(`/${p.slug}`)}},openGraph:{title:p.title,description:p.description,url:absoluteUrl(`/${p.slug}`)}}}
export default async function Page({params}:{params:Promise<{marketingSlug:string}>}){const{marketingSlug}=await params;const p=marketingBySlug.get(marketingSlug);if(!p||p.slug.includes("/"))notFound();return <MarketingShell><FeaturePage page={p}/></MarketingShell>}
