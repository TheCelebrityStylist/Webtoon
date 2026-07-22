"use client";

import type { StoryImpact } from "@/lib/story-canvas/impact-engine";
import type { StoryObservation } from "@/lib/story-canvas/types";

const group = (proposal: StoryObservation) => proposal.kind === "person" ? "People" : proposal.kind === "place" ? "Places" : proposal.kind === "object" ? "Objects" : "State";

export function StoryPulse({ proposals, impact, expanded, onExpand, onConfirm, onDismiss, onReviewScene, onUndo }: { proposals: StoryObservation[]; impact: StoryImpact | null; expanded: boolean; onExpand: () => void; onConfirm: (ids: string[]) => void; onDismiss: (id: string) => void; onReviewScene: (id: string) => void; onUndo: () => void }) {
  if (!proposals.length && !impact) return null;
  if (!expanded) return <section className={`story-pulse collapsed ${impact ? "warning" : ""}`} aria-live="polite"><button onClick={onExpand}><i/>{impact ? `Reality changed · ${impact.affectedScenes.length} later scenes affected` : `${proposals.length} story details found`}<span>Review</span></button><button onClick={() => onConfirm(proposals.map((item) => item.id))}>Confirm all</button></section>;
  if (impact) return <section className="story-pulse expanded reality" aria-label="Reality changed"><header><div><small>Reality changed</small><h2>{impact.changed.title}</h2></div><button onClick={onExpand} aria-label="Collapse Story Pulse">⌄</button></header><div className="reality-comparison"><div><small>Before</small><strong>{impact.before?.predicate === "holder" ? `Held by ${impact.before.value}` : impact.before?.value}</strong></div><span>→</span><div><small>Now</small><strong>{impact.changed.predicate === "location" ? `Located in ${impact.changed.value}` : impact.changed.value}</strong></div></div>{impact.affectedScenes.length > 0 && <div className="impact-scenes"><small>Potential conflict</small>{impact.affectedScenes.map((scene) => <button key={scene.id} onClick={() => onReviewScene(scene.id)}><strong>{scene.title}</strong><span>{scene.chapterId.replace("chapter-", "Chapter ")} · &ldquo;{scene.quote}&rdquo;</span><em>{scene.reason}</em></button>)}</div>}<footer><button className="primary" onClick={() => onConfirm([impact.changed.id])}>Confirm new reality</button><button onClick={() => onDismiss(impact.changed.id)}>Keep previous canon</button>{impact.affectedScenes[0] && <button onClick={() => onReviewScene(impact.affectedScenes[0].id)}>Review future scene</button>}<button onClick={onUndo}>Undo prose edit</button></footer></section>;
  const groups = Object.entries(Object.groupBy(proposals, group));
  return <section className="story-pulse expanded" aria-label="Story Pulse"><header><div><small>Story Pulse</small><h2>{proposals.length} story details found</h2></div><button onClick={onExpand} aria-label="Collapse Story Pulse">⌄</button></header><div className="pulse-groups">{groups.map(([name, items]) => <section key={name}><h3>{name}</h3>{items?.map((proposal) => <article key={proposal.id}><span className={`pulse-icon ${proposal.kind}`}/><div><strong>{proposal.kind === "state" ? proposal.title : stateSubject(proposal)}</strong><span>{proposal.title}</span><q>{proposal.quote}</q></div><button onClick={() => onConfirm([proposal.id])} aria-label={`Accept ${proposal.title}`}>＋</button><button onClick={() => onDismiss(proposal.id)} aria-label={`Dismiss ${proposal.title}`}>×</button></article>)}</section>)}</div><footer><button className="primary" onClick={() => onConfirm(proposals.map((item) => item.id))}>Add to story</button><button onClick={onExpand}>Review later</button></footer></section>;
}

function stateSubject(proposal: StoryObservation) {
  if (proposal.kind === "person") return proposal.value;
  if (proposal.kind === "place") return proposal.value;
  if (proposal.kind === "object") return proposal.value;
  return proposal.title;
}
