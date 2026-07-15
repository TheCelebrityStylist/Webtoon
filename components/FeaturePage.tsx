"use client";
import Link from "next/link";
import { useState } from "react";
import type { MarketingPage } from "@/lib/marketing";
import { pricingConfig } from "@/lib/marketing";

export function FeaturePage({page:p}:{page:MarketingPage}){
  const [active,setActive]=useState(0);
  const [billing,setBilling]=useState<"monthly"|"annual">("annual");
  return <main className={`feature-page feature-page--${p.kind}`}>
    <nav aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true"> / </span><span>{p.eyebrow}</span></nav>
    <header className="feature-hero"><div><p className="eyebrow">{p.eyebrow}</p><h1>{p.title}</h1><p>{p.description}</p><div className="hero-actions"><Link className="button signal" href="/sign-up">Start writing</Link><a href="#proof">Explore the proof ↓</a></div></div><div className="feature-orbit" aria-hidden="true"><i/><i/><i/><strong>✦</strong></div></header>
    <div className="feature-proof">{p.proof.map((x,i)=><button key={x} onClick={()=>setActive(i)} aria-pressed={active===i}><b>0{i+1}</b>{x}</button>)}</div>
    <section id="proof" className="proof-console"><div><small>INTERACTIVE PRODUCT PROOF</small><h2>{p.interaction.label}</h2><p>{p.interaction.input}</p></div><output aria-live="polite"><span>ASTERISM / TRACE {String(active+1).padStart(2,"0")}</span><strong>{p.interaction.output}</strong><button onClick={()=>setActive((active+1)%p.proof.length)}>Trace next consequence →</button></output></section>
    <div className="feature-story">{p.sections.map((section,i)=><section key={section.title}><span>{String(i+1).padStart(2,"0")}</span><div><h2>{section.title}</h2><p>{section.body}</p></div><i aria-hidden="true"/></section>)}</div>
    {p.slug==="pricing"&&<section className="pricing-stage"><header><div><small>FOUNDING ACCESS</small><h2>Choose the scale of your story system.</h2></div><div className="billing-toggle" aria-label="Billing period preview">{pricingConfig.billingPeriods.map(period=><button key={period} aria-pressed={billing===period} onClick={()=>setBilling(period)}>{period}</button>)}</div></header><p className="pricing-note">Founding access is invitation-based. Checkout is not enabled, and no payment is collected.</p><div className="plan-table">{pricingConfig.plans.map(plan=><article data-recommended={plan.recommended} key={plan.id}>{plan.recommended&&<small>RECOMMENDED START</small>}<h3>{plan.name}</h3><p>{plan.description}</p><strong>{billing==="annual"?"Annual capacity preview":"Monthly capacity preview"}</strong><ul>{plan.features.map(feature=><li key={feature}>✓ {feature}</li>)}</ul><Link href="/sign-up">Request founding access</Link></article>)}</div></section>}
    <section className="related-routes"><small>KEEP EXPLORING</small>{p.links.map(slug=><Link href={`/${slug}`} key={slug}>{slug.split("/").at(-1)?.replaceAll("-"," ")} <span>↗</span></Link>)}</section>
    <aside className="page-cta"><div><small>START WITH ONE SCENE</small><h2>See the whole story.</h2></div><Link className="button signal" href="/sign-up">Build your story system</Link></aside>
  </main>
}
