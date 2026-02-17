import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";

const faqs = [
  [
    "Why unlock early?",
    "Unlocking early is how you stay ahead of the public drop instead of waiting for the same episode to open a week later. When you unlock, you continue instantly, protect your momentum, and reach major arc moments before spoiler threads start circulating. Readers who unlock also keep their weekly progression intact, which matters if you are following multiple active series at once. It is designed for people who care about finishing story beats now, not later, and who want the satisfaction of being first through a turning point rather than catching up after everyone else.",
  ],
  [
    "What do Access Pass credits do?",
    "Access Pass credits unlock future episodes before public release so you can continue immediately when a cliffhanger hits. Think of credits as progression tokens: you spend them to remove waiting time, maintain your streak, and complete arcs on your schedule. Different packs are available so light readers can unlock selectively while heavy readers can stay ahead each week. Credits can also open bonus scenes when available, giving you extra story context that may not be part of the free path at launch. You are never required to subscribe; you only use credits when early continuation matters to you.",
  ],
  [
    "Do creators get paid when I unlock?",
    "Yes. Unlocks are directly tied to creator support in the product model. When you use Access Pass credits, a share of that unlock contributes to funding future episodes and ongoing production for the series you are reading. This means your decision to continue early has a clear impact beyond your own progress: it helps creators keep a steady release cadence and invest in better art, pacing, and bonus material. In short, unlocking is not only personal convenience; it is an active signal that supports the stories you want to keep moving forward.",
  ],
  [
    "What happens if I wait?",
    "If you wait for public release, you keep access to the free track, but you trade speed for delay. That usually means waiting several days for the next episode, risking spoilers from readers who unlocked earlier, and pausing your active progression right after a cliffhanger. Waiting can also interrupt your momentum across multiple series, especially during high-intensity arc weeks. For many readers, the biggest cost is not money saved; it is lost continuity. Access Pass exists for moments where you would rather keep your flow and finish the next beat now instead of returning later.",
  ],
  [
    "Can I keep my reading streak?",
    "Yes. The streak system is designed to reward consistent continuation, and early unlocks help you protect that consistency when an episode is locked. If the next chapter is not yet public, using Access Pass lets you keep reading and avoid a forced gap that can break your weekly rhythm. Streaks are useful because they turn reading into progression you can feel, not just isolated sessions. Maintaining a streak also keeps you closer to active community conversation around current episodes, which is part of the belonging experience for ongoing series followers.",
  ],
  [
    "Is early access permanent?",
    "Yes. Once you unlock an episode with Access Pass, it remains unlocked for your account, so you can return and reread it any time. Early access gives you immediate continuation now and lasting access afterward; it is not a temporary rental window. Public release still happens later for everyone, but your unlock means you did not have to wait and you keep ownership of that early progression in your reading history. This makes Access Pass useful both for staying ahead in the moment and for revisiting key episodes when the arc reaches a major reveal.",
  ],
] as const;

export const metadata: Metadata = {
  title: "FAQ | EU Webtoon",
  description: "Answers about early unlocks, Access Pass credits, creator support, waiting tradeoffs, and streak progression.",
  alternates: { canonical: absoluteUrl("/faq") },
};

export default function FaqPage() {
  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">FAQ</h1>
        <div className="mt-4 space-y-2">
          {faqs.map(([q, a]) => (
            <details key={q} className="rounded-xl border border-slate-200 p-3">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-sm text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
