// components/Header.tsx
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          PanelForge
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/studio" className="nav-cta">Writing studio</Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
