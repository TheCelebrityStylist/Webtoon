import type { Metadata } from "next";
import { WaitlistCapture } from "@/components/WaitlistCapture";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Creator Program | EU Webtoon",
  description: "Apply to the invite-only creator pilot. Keep your rights, publish weekly, and grow with transparent Fast Pass economics.",
  alternates: { canonical: absoluteUrl("/creators") },
};

export default function CreatorsPage() {
  return (
    <div className="space-y-6">
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Creator Program (Invite-only MVP)</h1>
        <p className="mt-3 text-sm text-slate-700">We partner with creators ready to publish consistently, collaborate with editorial direction, and build long-term reader retention.</p>
      </section>

      <section className="section-shell">
        <h2 className="text-xl font-semibold">Revenue model & onboarding FAQ</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><strong>Rights ownership:</strong> You retain original IP ownership.</div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><strong>Exclusivity:</strong> No blanket exclusivity in MVP.</div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><strong>Payout timing:</strong> Monthly reporting and payout windows.</div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><strong>Formats:</strong> Vertical episodes, side stories, bonus drops.</div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><strong>Moderation:</strong> Content policy and safety review in onboarding.</div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><strong>Promotion:</strong> Staff picks and launch slot opportunities.</div>
        </div>
      </section>

      <section className="section-shell">
        <WaitlistCapture type="creator" />
      </section>
    </div>
  );
}
