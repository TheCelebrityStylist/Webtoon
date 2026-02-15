import type { Metadata } from "next";
import { WaitlistCapture } from "@/components/WaitlistCapture";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Creator Program | EU Webtoon",
  description: "Apply to the invite-only creator pilot. Keep your rights, publish weekly, and grow with transparent Fast Pass economics.",
  alternates: { canonical: absoluteUrl("/creators") },
};

export default function CreatorsPage() {
  const faqs = [
    ["Who can apply?", "Creators with a clear vertical storytelling practice and reliable release intent."],
    ["Do I keep my IP?", "Yes. Original rights remain with creators in MVP agreements."],
    ["Is exclusivity required?", "No blanket exclusivity is required during MVP."],
    ["How are payouts handled?", "Monthly reporting and payout windows based on Fast Pass unlocks."],
    ["Do you provide analytics?", "Yes, creator-facing performance snapshots are part of pilot support."],
    ["What formats are supported?", "Vertical episodes, side stories, and launch bonus content."],
    ["Can teams apply?", "Yes, studio teams and solo creators are both eligible."],
    ["How many episodes should I have?", "At least a launch-ready pilot and a short runway is recommended."],
    ["Do you help with marketing?", "Yes, editorial collection placement and launch packaging support are included."],
    ["How fast is onboarding?", "Timing depends on queue and review bandwidth during pilot."],
    ["Can I use AI Studio outputs commercially?", "Yes, with creator responsibility for final quality and rights checks."],
    ["What content is not allowed?", "Hate content, exploitation, and policy-violating material are rejected."],
  ] as const;

  return (
    <div className="space-y-6">
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Creator Program (Invite-only MVP)</h1>
        <p className="mt-3 text-sm text-slate-700">We partner with creators ready to publish consistently, collaborate with editorial direction, and build long-term reader retention.</p>
      </section>

      <section className="section-shell">
        <h2 className="text-xl font-semibold">Revenue model and creator value</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Free-first discovery plus optional Fast Pass unlocks.</li>
          <li>Transparent unlock economics and monthly payout cycles.</li>
          <li>Rights clarity and creator-first publishing posture.</li>
          <li>Editorial surfacing opportunities in collections and launches.</li>
        </ul>
      </section>

      <section className="section-shell">
        <h2 className="text-xl font-semibold">Creator FAQ</h2>
        <div className="mt-4 space-y-2">
          {faqs.map(([q, a]) => (
            <details key={q} className="rounded-xl border border-slate-200 p-3">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-sm text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <WaitlistCapture type="creator" />
      </section>
    </div>
  );
}
