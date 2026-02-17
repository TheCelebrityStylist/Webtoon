import type { ArcDefinition, ArcKey, Episode, LockState, ReaderProgressState, Series } from "@/lib/types";

export const ARC_DEFINITIONS: ArcDefinition[] = [
  { key: "arc1", label: "Arc 1: Setup", startEp: 1, endEp: 3, tensionHook: "Stakes snap into place by episode 2." },
  { key: "arc2", label: "Arc 2: Escalation", startEp: 4, endEp: 6, tensionHook: "Moral pressure turns into irreversible choices." },
  { key: "arc3", label: "Arc 3: Breakpoint", startEp: 7, endEp: 9, tensionHook: "The core truth fractures trust." },
  { key: "arc4", label: "Arc 4: Consequence", startEp: 10, endEp: 12, tensionHook: "Fallout rewrites who survives." },
  { key: "arc5", label: "Arc 5: Payoff", startEp: 13, endEp: 15, tensionHook: "Every promise demands payment." },
];

export function getArcForEpisode(ep: number): ArcDefinition {
  return ARC_DEFINITIONS.find((arc) => ep >= arc.startEp && ep <= arc.endEp) ?? ARC_DEFINITIONS[0];
}

export function getArcCompletionPercent(ep: number, arc: ArcDefinition): number {
  const span = arc.endEp - arc.startEp + 1;
  const completed = Math.max(0, Math.min(span, ep - arc.startEp + 1));
  return Math.round((completed / span) * 100);
}

export function getEpisodeLockState(ep: Episode): LockState {
  if (ep.isFree) return "free";
  if (ep.ep % 3 === 0) return "cliffhanger_locked";
  if (ep.ep % 5 === 0) return "bonus_locked";
  if (ep.ep % 2 === 0) return "streak_break_risk";
  return "arc_locked";
}

export function buildMockReaderProgress(series: Series, currentEp: number): ReaderProgressState {
  const arc = getArcForEpisode(currentEp);
  const completion = getArcCompletionPercent(currentEp, arc);

  return {
    reading_streak: 3,
    active_arc: arc.key,
    arc_completion_percent: completion,
    last_unlock_time: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    continuity_bonus: completion >= 66 ? "+12% continuity bonus active" : "+4% continuity bonus active",
    spoiler_risk_score: Math.min(92, 44 + currentEp * 3),
    bonus_available: completion >= 66,
  };
}

export function getArcPassCost(arcKey: ArcKey): number {
  return arcKey === "arc1" ? 5 : arcKey === "arc2" ? 5 : arcKey === "arc3" ? 6 : arcKey === "arc4" ? 7 : 8;
}
