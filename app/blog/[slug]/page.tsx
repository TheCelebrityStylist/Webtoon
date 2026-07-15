import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/MarketingShell";
import { articleBySlug, articles, readingMinutes } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = articleBySlug.get((await params).slug);
  if (!article) return {};
  return { title: article.title, description: article.description, alternates: { canonical: absoluteUrl(`/blog/${article.slug}`) }, openGraph: { type: "article", title: article.title, description: article.description, publishedTime: article.publishedAt, modifiedTime: article.revisedAt, url: absoluteUrl(`/blog/${article.slug}`) } };
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = articleBySlug.get((await params).slug); if (!article) notFound();
  const related = articles.filter((item) => item.slug !== article.slug && (item.category === article.category || item.tags.some((tag) => article.tags.includes(tag)))).slice(0, 2);
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: article.title, datePublished: article.publishedAt, dateModified: article.revisedAt, author: { "@type": "Organization", name: article.author }, mainEntityOfPage: absoluteUrl(`/blog/${article.slug}`) };
  return <MarketingShell><main className="article-layout"><aside><strong>On this page</strong>{article.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</aside><article><nav><Link href="/blog">Blog</Link> / {article.category}</nav><header><p className="eyebrow">PRODUCT-OWNED EDITORIAL</p><h1>{article.title}</h1><p>{article.excerpt}</p><small>{article.author} · {readingMinutes(article)} min · Revised {article.revisedAt}</small></header>{article.sections.map((section) => <section id={section.id} key={section.id}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<aside className="article-cta"><h2>Apply the thinking inside your project.</h2><Link className="button coral" href="/sign-up">Start writing</Link></aside>{related.length > 0 && <footer><h2>Related guides</h2>{related.map((item) => <Link href={`/blog/${item.slug}`} key={item.slug}>{item.title}</Link>)}</footer>}</article><script type="application/ld+json">{JSON.stringify(schema)}</script></main></MarketingShell>;
}
