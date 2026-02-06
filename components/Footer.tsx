// components/Footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between" }}>
        <span>© {new Date().getFullYear()} EU Webtoon MVP</span>
        <div className="nav">
          <Link href="/series">Browse</Link>
          <Link href="/about">About</Link>
        </div>
      </div>
    </footer>
  );
}
