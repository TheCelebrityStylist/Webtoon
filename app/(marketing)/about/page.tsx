// app/(marketing)/about/page.tsx
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description:
    "How this platform works: free episodes, Fast Pass early access via credits, and revenue sharing for creators.",
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <div className="space-y-4 text-neutral-800">
        <p>
          This is a vertical webtoon + serialized fiction platform optimized for
          mobile reading. Most episodes are free. Some episodes can be unlocked
          early using credits (Fast Pass).
        </p>
        <ul className="list-disc pl-6 text-neutral-700">
          <li>Readers: free to start, optional paid unlocks.</li>
          <li>Creators: publish episodes, earn revenue share.</li>
          <li>SEO-first: every series and episode has indexable URLs.</li>
        </ul>
      </div>
    </div>
  );
}
