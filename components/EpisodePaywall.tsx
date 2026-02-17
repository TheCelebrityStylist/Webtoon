"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  seriesSlug: string;
  episodeNumber: number;
  teaser: string;
  bonusTitles: string[];
};

const KEY = "eu_webtoon_wallet_v1";

type Wallet = {
  creditsBalance: number;
  subscriptionStatus: boolean;
  unlockedEpisodes: string[];
  tipsTotal: number;
};

function readWallet(): Wallet {
  if (typeof window === "undefined") return { creditsBalance: 0, subscriptionStatus: false, unlockedEpisodes: [], tipsTotal: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { creditsBalance: 0, subscriptionStatus: false, unlockedEpisodes: [], tipsTotal: 0 };
    return JSON.parse(raw) as Wallet;
  } catch {
    return { creditsBalance: 0, subscriptionStatus: false, unlockedEpisodes: [], tipsTotal: 0 };
  }
}

export function EpisodePaywall({ seriesSlug, episodeNumber, teaser, bonusTitles }: Props) {
  const [wallet, setWallet] = useState<Wallet>({ creditsBalance: 0, subscriptionStatus: false, unlockedEpisodes: [], tipsTotal: 0 });

  useEffect(() => setWallet(readWallet()), []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(wallet));
  }, [wallet]);

  const key = `${seriesSlug}:${episodeNumber}`;
  const unlocked = useMemo(() => wallet.unlockedEpisodes.includes(key) || wallet.subscriptionStatus, [wallet, key]);

  const unlock = () => {
    if (wallet.subscriptionStatus) {
      setWallet((w) => ({ ...w, unlockedEpisodes: Array.from(new Set([...w.unlockedEpisodes, key])) }));
      return;
    }
    if (wallet.creditsBalance < 3) return;
    setWallet((w) => ({ ...w, creditsBalance: w.creditsBalance - 3, unlockedEpisodes: Array.from(new Set([...w.unlockedEpisodes, key])) }));
  };

  return (
    <section className="section-shell rounded-2xl border border-amber-300 bg-amber-50">
      <h2 className="text-xl font-semibold text-amber-900">Locked boundary: spoiler risk ahead</h2>
      <p className="mt-2 whitespace-pre-line text-sm text-amber-900">{teaser}</p>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold">Continue now (3 credits)</p>
        <p className="mt-1 text-sm text-slate-600">Continuity+ includes monthly credits, streak protection, and discounted unlocks.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="cta-primary px-4 py-2 text-xs" onClick={unlock}>Continue now (3 credits)</button>
          <button className="cta-secondary px-4 py-2 text-xs" onClick={() => setWallet((w) => ({ ...w, subscriptionStatus: !w.subscriptionStatus }))}>Toggle Continuity+</button>
          <button className="cta-secondary px-4 py-2 text-xs" onClick={() => setWallet((w) => ({ ...w, tipsTotal: Number((w.tipsTotal + 2).toFixed(2)) }))}>Tip creator €2</button>
          <button className="cta-secondary px-4 py-2 text-xs" onClick={() => setWallet((w) => ({ ...w, creditsBalance: w.creditsBalance + 10 }))}>Add demo credits</button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Wallet: {wallet.creditsBalance} credits · {wallet.subscriptionStatus ? "Continuity+ active" : "No subscription"}</p>
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold">What you unlock</p>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
          {bonusTitles.map((title) => <li key={title}>{title}</li>)}
        </ul>
        <p className="mt-2 text-xs text-slate-500">{unlocked ? "Bonus POV scene preview unlocked." : "Bonus previews hidden until unlock."}</p>
      </div>
    </section>
  );
}
