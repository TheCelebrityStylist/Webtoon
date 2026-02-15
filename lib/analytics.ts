"use client";

type EventPayload = {
  eventName: string;
  path: string;
  ts: string;
  meta?: Record<string, string | number | boolean>;
};

const KEY = "euwebtoon-events";

export function trackEvent(eventName: string, meta?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  const payload: EventPayload = {
    eventName,
    path: window.location.pathname,
    ts: new Date().toISOString(),
    meta,
  };

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[analytics]", payload);
    return;
  }

  const events = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as EventPayload[];
  events.push(payload);
  window.localStorage.setItem(KEY, JSON.stringify(events.slice(-300)));
}
