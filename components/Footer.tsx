import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <p className="text-lg font-semibold">EU Webtoon</p>
          <p className="mt-2 text-sm text-slate-600">Premium vertical storytelling for readers and creators across Europe.</p>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <Link href="/readers" className="block hover:text-slate-900">For Readers</Link>
          <Link href="/creators" className="block hover:text-slate-900">For Creators</Link>
          <Link href="/webtoons" className="block hover:text-slate-900">Webtoons library</Link>
          <Link href="/compare" className="block hover:text-slate-900">Compare platforms</Link>
          <Link href="/community" className="block hover:text-slate-900">Community</Link>
          <Link href="/ai-studio" className="block hover:text-slate-900">AI Studio</Link>
          <Link href="/how-it-works" className="block hover:text-slate-900">How it works</Link>
          <Link href="/pricing" className="block hover:text-slate-900">Pricing</Link>
          <Link href="/faq" className="block hover:text-slate-900">FAQ</Link>
          <Link href="/creators" className="block hover:text-slate-900">Creator Program</Link>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <a href="#" className="block hover:text-slate-900">Terms</a>
          <a href="#" className="block hover:text-slate-900">Privacy</a>
          <a href="#" className="block hover:text-slate-900">Copyright</a>
          <a href="#" className="block hover:text-slate-900">DMCA Notice</a>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <a href="mailto:contact@euwebtoon.com" className="block hover:text-slate-900">contact@euwebtoon.com</a>
          <a href="mailto:creators@euwebtoon.com" className="block hover:text-slate-900">creators@euwebtoon.com</a>
          <p>© {new Date().getFullYear()} EU Webtoon MVP</p>
        </div>
      </div>
    </footer>
  );
}
