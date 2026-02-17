"use client";

import { useEffect, useMemo, useState } from "react";

type WalletState = {
  creditsBalance: number;
  subscriptionStatus: boolean;
  unlockedEpisodes: string[];
  tipsTotal: number;
};

const KEY = "eu_webtoon_wallet_v1";

function readWallet(): WalletState {
  if (typeof window === "undefined") return { creditsBalance: 0, subscriptionStatus: false, unlockedEpisodes: [], tipsTotal: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { creditsBalance: 0, subscriptionStatus: false, unlockedEpisodes: [], tipsTotal: 0 };
    return JSON.parse(raw) as WalletState;
  } catch {
    return { creditsBalance: 0, subscriptionStatus: false, unlockedEpisodes: [], tipsTotal: 0 };
  }
}

export function WalletDemo() {
  const [wallet, setWallet] = useState<WalletState>({ creditsBalance: 0, subscriptionStatus: false, unlockedEpisodes: [], tipsTotal: 0 });

  useEffect(() => {
    setWallet(readWallet());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(wallet));
  }, [wallet]);

  const status = useMemo(() => (wallet.subscriptionStatus ? "Active subscriber" : "No active subscription"), [wallet.subscriptionStatus]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-semibold">Wallet demo (MVP local)</h3>
      <p className="mt-1 text-sm text-slate-600">Credits: {wallet.creditsBalance} · {status} · Tips: €{wallet.tipsTotal.toFixed(2)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="cta-secondary px-3 py-2 text-xs" onClick={() => setWallet((w) => ({ ...w, creditsBalance: w.creditsBalance + 10 }))}>Add 10 credits</button>
        <button className="cta-secondary px-3 py-2 text-xs" onClick={() => setWallet((w) => ({ ...w, subscriptionStatus: !w.subscriptionStatus }))}>Toggle subscription</button>
        <button className="cta-secondary px-3 py-2 text-xs" onClick={() => setWallet((w) => ({ ...w, tipsTotal: Number((w.tipsTotal + 2).toFixed(2)) }))}>Tip €2</button>
      </div>
    </section>
  );
}
