"use client";
import Link from "next/link";
import { useState } from "react";
import type { MarketingPage } from "@/lib/marketing";
import { pricingConfig } from "@/lib/marketing";
import { brand } from "@/lib/site";
import { majorExperienceSlugs, ProductExperience } from "@/components/ProductExperiences";

type Currency=keyof typeof pricingConfig.currencies;
export function FeaturePage({page:p}:{page:MarketingPage}){
  const[active,setActive]=useState(0);const[billing,setBilling]=useState<"monthly"|"annual">("annual");const[currency,setCurrency]=useState<Currency>("EUR");
  if(majorExperienceSlugs.has(p.slug as never))return <ProductExperience slug={p.slug}/>;
  return <main className={`feature-page feature-page--${p.kind}`}>
    <nav aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true"> / </span><span>{p.eyebrow}</span></nav>
    <header className="feature-hero"><div><p className="eyebrow">{p.eyebrow}</p><h1>{p.title}</h1><p>{p.description}</p><div className="hero-actions"><Link className="button warm" href="/sign-up">Start writing free</Link><a href="#proof">Try it here ↓</a></div></div><div className="feature-orbit" aria-hidden="true"><strong>{brand.marks.symbol}</strong></div></header>
    <div className="feature-proof">{p.proof.map((item,index)=><button key={item} onClick={()=>setActive(index)} aria-pressed={active===index}><b>{String(index+1).padStart(2,"0")}</b>{item}</button>)}</div>
    <section id="proof" className="proof-console"><div><small>TRY A MOMENT</small><h2>{p.interaction.label}</h2><p>{p.interaction.input}</p></div><output aria-live="polite"><span>{brand.name.toUpperCase()} · EXAMPLE {String(active+1).padStart(2,"0")}</span><strong>{p.interaction.output}</strong><button onClick={()=>setActive((active+1)%p.proof.length)}>Try another moment →</button></output></section>
    <div className="feature-story">{p.sections.map((section,index)=><section key={section.title}><span>{String(index+1).padStart(2,"0")}</span><div><h2>{section.title}</h2><p>{section.body}</p></div><i aria-hidden="true"/></section>)}</div>
    {p.slug==="pricing"&&<section className="pricing-stage"><header><div><small>WRITING PLANS</small><h2>Start free. Grow when your story does.</h2></div><div><div className="billing-toggle" aria-label="Billing period">{pricingConfig.billingPeriods.map(period=><button key={period} aria-pressed={billing===period} onClick={()=>setBilling(period)}>{period}</button>)}</div><label>Currency <select value={currency} onChange={event=>setCurrency(event.target.value as Currency)}>{Object.keys(pricingConfig.currencies).map(code=><option key={code}>{code}</option>)}</select></label></div></header><p className="pricing-note">Create an account and begin writing without a card. Paid plans add more active stories and deeper reviews.</p><div className="plan-table">{pricingConfig.plans.map(plan=>{const monthly=plan.monthly[currency];const shown=billing==="annual"?Math.round(monthly*.8):monthly;return <article data-recommended={plan.recommended} key={plan.id}>{plan.recommended&&<small>MOST POPULAR</small>}<h3>{plan.name}</h3><p>{plan.description}</p><strong>{pricingConfig.currencies[currency]}{shown}<small> / month{billing==="annual"?", billed annually":""}</small></strong><ul>{plan.features.map(feature=><li key={feature}>✓ {feature}</li>)}</ul><Link href="/sign-up">Start writing free</Link></article>})}</div><details><summary>Compare every plan</summary><p>All plans keep projects private, include Google connection, and let you export your writing. Professional adds multilingual and deeper revision work; Studio adds private collaboration.</p></details></section>}
    <section className="related-routes"><small>KEEP EXPLORING</small>{p.links.map(slug=><Link href={`/${slug}`} key={slug}>{slug.split("/").at(-1)?.replaceAll("-"," ")} <span>↗</span></Link>)}</section>
    <aside className="page-cta"><div><small>BEGIN WITH ONE SCENE</small><h2>Keep your whole story close.</h2></div><Link className="button warm" href="/sign-up">Start writing free</Link></aside>
  </main>
}
