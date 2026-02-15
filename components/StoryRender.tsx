"use client";

import { useMemo, useState } from "react";

export function StoryRender({ content }: { content: string }) {
  const [size, setSize] = useState(100);
  const [dark, setDark] = useState(false);
  const paragraphs = useMemo(() => content.split(/\n\n+/).filter(Boolean), [content]);

  return (
    <div className={`rounded-2xl border p-5 ${dark ? "border-slate-800 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button className="cta-secondary px-3 py-1.5 text-xs" onClick={() => setSize((v) => Math.max(90, v - 5))}>A-</button>
        <button className="cta-secondary px-3 py-1.5 text-xs" onClick={() => setSize((v) => Math.min(125, v + 5))}>A+</button>
        <button className="cta-secondary px-3 py-1.5 text-xs" onClick={() => setDark((v) => !v)}>{dark ? "Light mode" : "Dark mode"}</button>
      </div>
      <div style={{ fontSize: `${size}%` }} className="space-y-6 leading-8">
        {paragraphs.map((paragraph, idx) => (
          <p key={`${idx}-${paragraph.slice(0, 12)}`}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
