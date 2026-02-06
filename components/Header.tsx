// components/Header.tsx
import Link from "next/link";

export function Header() {
  return (
    <header style={{ borderBottom: "1px solid #e5e7eb" }}>
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
        }}
      >
        <Link href="/" style={{ fontWeight: 600, letterSpacing: "-0.01em" }}>
          EU Webtoon
        </Link>
        <nav style={{ display: "flex", gap: "16px", fontSize: "14px" }}>
          <Link href="/series">Series</Link>
          <Link href="/ai-stylist">AI Stylist</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}
