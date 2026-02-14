import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-slate-900">EU Webtoon</p>
          <p className="mt-2 text-sm text-slate-600">European stories, vertical-first reading, creator-first economics.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
          <Link href="/about" className="hover:text-slate-900">How it works</Link>
          <Link href="#" className="hover:text-slate-900">Terms</Link>
          <Link href="#" className="hover:text-slate-900">Privacy</Link>
          <Link href="#" className="hover:text-slate-900">Copyright</Link>
          <Link href="#" className="hover:text-slate-900">DMCA Notice</Link>
          <Link href="mailto:contact@euwebtoon.com" className="hover:text-slate-900">Contact</Link>
          <Link href="/about#creators" className="hover:text-slate-900">Creator Program</Link>
        </div>
        <div className="text-sm text-slate-500">© {new Date().getFullYear()} EU Webtoon MVP. Invite-only creator onboarding.</div>
      </div>
    </footer>
  );
}
