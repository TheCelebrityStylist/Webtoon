// components/Header.tsx
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          EU Webtoon
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/series" className="hover:underline">
            Series
          </Link>
          <Link href="/look" className="hover:underline">
            AI Stylist
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
