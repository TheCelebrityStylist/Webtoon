"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Audience = "readers" | "creators";

const commonLinks = [{ href: "/pricing", label: "Pricing" }];

const readerLinks = [
  { href: "/readers", label: "Reader track" },
  { href: "/webtoons", label: "Browse library" },
  { href: "/community", label: "Community" },
  ...commonLinks,
];

const creatorLinks = [
  { href: "/creators", label: "Creator program" },
  { href: "/creator-portal", label: "Portal" },
  { href: "/ai-studio", label: "Studio" },
  ...commonLinks,
];

function inferAudience(pathname: string): Audience {
  if (["/creators", "/creator-portal", "/ai-studio"].some((p) => pathname.startsWith(p))) return "creators";
  return "readers";
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState<Audience>(inferAudience(pathname));

  useEffect(() => {
    const stored = window.localStorage.getItem("eu_audience");
    if (stored === "readers" || stored === "creators") setAudience(stored);
    else setAudience(inferAudience(pathname));
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    window.localStorage.setItem("eu_audience", audience);
  }, [audience]);

  const links = useMemo(() => (audience === "readers" ? readerLinks : creatorLinks), [audience]);
  const cta = audience === "readers" ? { href: "/webtoons", label: "Start reading free" } : { href: "/creators#apply", label: "Apply to Creator Program" };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">EU Webtoon</Link>

          <div className="ml-1 hidden rounded-full border border-slate-300 bg-slate-100 p-1 sm:inline-flex">
            <button className={`rounded-full px-3 py-1 text-xs font-semibold ${audience === "readers" ? "bg-white text-slate-900 shadow" : "text-slate-600"}`} onClick={() => setAudience("readers")}>For Readers</button>
            <button className={`rounded-full px-3 py-1 text-xs font-semibold ${audience === "creators" ? "bg-white text-slate-900 shadow" : "text-slate-600"}`} onClick={() => setAudience("creators")}>For Creators</button>
          </div>

          <nav className="ml-auto hidden items-center gap-5 md:flex" aria-label="Primary">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={`text-sm font-medium ${pathname.startsWith(link.href) ? "text-slate-900" : "text-slate-600 hover:text-slate-900"}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <Link href={cta.href} className="cta-primary hidden md:inline-flex">{cta.label}</Link>
          <button className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 md:hidden" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>Menu</button>
        </div>
      </div>

      <div className={`fixed inset-0 z-40 md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button className={`absolute inset-0 bg-slate-900/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} aria-label="Close menu" onClick={() => setOpen(false)} />
        <aside id="mobile-nav" className={`absolute right-0 top-0 h-full w-[86%] max-w-sm border-l border-slate-200 bg-white p-5 shadow-2xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="mb-4 inline-flex rounded-full border border-slate-300 bg-slate-100 p-1">
            <button className={`rounded-full px-3 py-1 text-xs font-semibold ${audience === "readers" ? "bg-white text-slate-900" : "text-slate-600"}`} onClick={() => setAudience("readers")}>For Readers</button>
            <button className={`rounded-full px-3 py-1 text-xs font-semibold ${audience === "creators" ? "bg-white text-slate-900" : "text-slate-600"}`} onClick={() => setAudience("creators")}>For Creators</button>
          </div>
          <nav className="space-y-2">
            {links.map((link) => <Link key={link.href} href={link.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100">{link.label}</Link>)}
          </nav>
          <Link href={cta.href} className="cta-primary mt-5 w-full justify-center">{cta.label}</Link>
        </aside>
      </div>
    </header>
  );
}
