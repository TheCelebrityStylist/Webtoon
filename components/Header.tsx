"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

const links = [
  { href: "/webtoons", label: "Start reading" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/ai-studio", label: "AI Studio" },
  { href: "/for-creators", label: "For creators" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-950">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-white dark:bg-slate-950" />
      <div className="relative mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100" onClick={() => trackEvent("nav_logo_click")}>
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
                className={`text-sm font-medium ${active ? "text-slate-900 dark:text-slate-100" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"}`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/pricing" className="cta-primary hidden md:inline-flex" onClick={() => trackEvent("header_primary_cta")}>
          Get credits
        </Link>
        <button
          type="button"
          className="ml-auto inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:hidden"
          aria-label="Open mobile menu"
          aria-expanded={open}
          aria-controls="mobile-menu-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>

      <div className={`fixed inset-0 z-40 md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
        <button
          type="button"
          className={`absolute inset-0 bg-slate-900/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
        <aside
          id="mobile-menu-drawer"
          className={`absolute right-0 top-0 h-full w-[86%] max-w-sm border-l border-slate-200 bg-white p-5 shadow-2xl transition-transform dark:border-slate-800 dark:bg-slate-950 ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Continuity Lane</p>
            <button type="button" className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700" onClick={() => setOpen(false)} aria-label="Close menu">
              Close
            </button>
          </div>
          <nav className="space-y-2" aria-label="Mobile">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 space-y-2">
            <Link href="/webtoons" className="cta-secondary w-full justify-center">
              Start free
            </Link>
            <Link href="/pricing" className="cta-primary w-full justify-center">
              Get credits
            </Link>
          </div>
        </aside>
      </div>
    </header>
  );
}
