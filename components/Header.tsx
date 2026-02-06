// components/Header.tsx
import Link from "next/link";

export function Header() {
  return (
    <header className="header">
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 0" }}
      >
        <Link href="/" style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
          EU Webtoon
        </Link>
        <nav className="nav" style={{ marginLeft: "auto" }} aria-label="Primary">
          <Link href="/series">Series</Link>
          <Link href="/ai-stylist">AI Studio</Link>
          <Link href="/about">About</Link>
        </nav>
        <Link href="/series" className="btn btnPrimary">
          Start reading
        </Link>
      </div>
    </header>
  );
}
