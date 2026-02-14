"use client";

import { FormEvent, useState } from "react";

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function WaitlistCapture({ type }: { type: "reader" | "creator" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validEmail(email)) {
      setStatus("Please enter a valid email address.");
      return;
    }
    const key = type === "reader" ? "euwebtoon-reader-waitlist" : "euwebtoon-creator-waitlist";
    const existing = JSON.parse(localStorage.getItem(key) || "[]") as string[];
    const next = Array.from(new Set([...existing, email.toLowerCase()]));
    localStorage.setItem(key, JSON.stringify(next));
    setStatus("Saved locally (MVP). Connect this to your CRM in production.");
    setEmail("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{type === "reader" ? "Reader waitlist" : "Creator waitlist"}</label>
      <div className="flex flex-wrap gap-2">
        <input
          aria-label={`${type} waitlist email`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="min-w-[220px] flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm"
        />
        <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Join</button>
      </div>
      {status ? <p className="text-xs text-slate-600">{status}</p> : null}
    </form>
  );
}
