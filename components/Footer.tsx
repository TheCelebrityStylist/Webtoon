// components/Footer.tsx
import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-600">
        <div className="flex flex-col gap-2">
          <p>© {new Date().getFullYear()} {site.shortName}</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <Link href="/studio" className="hover:underline">Writing studio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
