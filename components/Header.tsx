// components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/series", label: "Series" },
    { href: "/ai-stylist", label: "AI Stylist" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="header">
      <div className="container" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 0" }}>
        <Link href="/" style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
          EU Webtoon
        </Link>
        <nav className="nav" style={{ marginLeft: "auto" }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/series" className="button button-primary">
          Start reading
        </Link>
      </div>
    </header>
  );
}
