"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

const links = [
  { href: "/series", label: "Browse library" },
  { href: "/ai-stylist", label: "AI Studio" },
  { href: "/about", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/creators", label: "For creators" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900" onClick={() => trackEvent("nav_logo_click")}>
          EU Webtoon
        </Link>
        <nav className="ml-auto hidden items-center gap-5 md:flex" aria-label="Primary">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => trackEvent("nav_link_click", { href: link.href })}
                className={`text-sm font-medium ${active ? "text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
                {active ? <span className="mt-1 block h-0.5 w-full rounded-full bg-indigo-600" /> : null}
              </Link>
            );
          })}
        </nav>
        <Link href="/series" className="cta-primary hidden md:inline-flex" onClick={() => trackEvent("header_primary_cta")}>Start reading free</Link>
      </div>
    </header>
  );
}
