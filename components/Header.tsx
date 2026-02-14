// components/Header.tsx
import Link from "next/link";

export function Header() {
  return (
    <header className="header">
      <div className="container headerInner">
        <Link href="/" className="brand">
          EU Webtoon
          <span className="brandBadge">MVP</span>
        </Link>
        <nav className="nav" aria-label="Primary">
          <Link href="/series" className="navLink">
            Series
          </Link>
          <Link href="/ai-stylist" className="navLink">
            AI Studio
          </Link>
          <Link href="/about" className="navLink">
            About
          </Link>
        </nav>
        <div className="headerActions">
          <Link href="/series" className="btn btnGhost">
            Browse library
          </Link>
          <Link href="/ai-stylist" className="btn btnPrimary">
            Create a series
          </Link>
        </div>
      </div>
    </header>
  );
}
