"use client";

const KEY = "euwebtoon-variant";

export type Variant = "A" | "B" | "C";

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 33 + value.charCodeAt(i)) >>> 0;
  return h;
}

export function getVariant(): Variant {
  if (typeof window === "undefined") return "A";
  const existing = window.localStorage.getItem(KEY) as Variant | null;
  if (existing === "A" || existing === "B" || existing === "C") return existing;

  const base = `${navigator.userAgent}-${window.screen.width}-${window.screen.height}`;
  const variants: Variant[] = ["A", "B", "C"];
  const picked = variants[hash(base) % variants.length];
  window.localStorage.setItem(KEY, picked);
  document.cookie = `euwebtoon_variant=${picked}; path=/; max-age=31536000`;
  return picked;
}
