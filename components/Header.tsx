import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          EU Webtoon
        </Link>
        <nav className="ml-auto hidden items-center gap-5 text-sm font-medium text-slate-700 md:flex" aria-label="Primary">
          <Link href="/series" className="hover:text-slate-900">Browse library</Link>
          <Link href="/ai-stylist" className="hover:text-slate-900">AI Studio</Link>
          <Link href="/about" className="hover:text-slate-900">How it works</Link>
          <Link href="/about#creators" className="hover:text-slate-900">For creators</Link>
        </nav>
        <Link href="/series" className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 md:inline-flex">
          Start reading free
        </Link>
      </div>
    </header>
  );
}
