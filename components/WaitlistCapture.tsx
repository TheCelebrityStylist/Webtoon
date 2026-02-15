"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "@/lib/analytics";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function WaitlistCapture({ type }: { type: "reader" | "creator" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setStatus("Please enter a valid email address.");
      return;
    }
    const key = type === "reader" ? "eu_reader_waitlist" : "eu_creator_waitlist";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    const next = [...new Set([...existing, email.toLowerCase()])];
    localStorage.setItem(key, JSON.stringify(next));
    setStatus("Saved locally (MVP). Connect to your CRM when backend capture is ready.");
    trackEvent("waitlist_submit", { type, size: next.length });
    setEmail("");
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label className="text-sm font-semibold text-slate-800">{type === "reader" ? "Reader waitlist" : "Creator waitlist"}</label>
      <div className="flex flex-wrap gap-2">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-label={`${type} waitlist email`}
          className="min-w-[220px] flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm"
        />
        <button className="cta-primary px-4 py-2 text-xs">Join waitlist</button>
      </div>
      {status ? <p className="text-xs text-slate-600">{status}</p> : null}
    </form>
  );
}
