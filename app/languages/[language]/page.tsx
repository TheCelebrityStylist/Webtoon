import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/MarketingShell";
import { FeaturePage } from "@/components/FeaturePage";
import { marketingBySlug } from "@/lib/marketing";
import { absoluteUrl } from "@/lib/seo";
const languages=["english","dutch","german","spanish","portuguese"];
export function generateStaticParams(){return languages.map(language=>({language}))}
export async function generateMetadata({params}:{params:Promise<{language:string}>}):Promise<Metadata>{const{language}=await params;const p=marketingBySlug.get(`languages/${language}`);return p?{title:p.title,description:p.description,alternates:{canonical:absoluteUrl(`/${p.slug}`)}}:{}}
export default async function LanguagePage({params}:{params:Promise<{language:string}>}){const{language}=await params;const p=marketingBySlug.get(`languages/${language}`);if(!p)notFound();return <MarketingShell><FeaturePage page={p}/></MarketingShell>}
