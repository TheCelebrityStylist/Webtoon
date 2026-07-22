import type { CanvasState, StoryObservation } from "./types";

export type StoryImpact = { changed: StoryObservation; before?: StoryObservation; affectedScenes: Array<{ id: string; title: string; chapterId: string; quote: string; reason: string }> };

export function calculateImpact(state: CanvasState, proposal: StoryObservation): StoryImpact | null {
  if (proposal.predicate !== "location" && proposal.predicate !== "holder") return null;
  const before = [...state.observations].reverse().find((item) => item.subjectId === proposal.subjectId && item.status === "confirmed" && (item.predicate === "holder" || item.predicate === "location"));
  if (!before || before.value === proposal.value) return null;
  const entity = state.entities.find((item) => item.id === proposal.subjectId);
  const currentOrder = state.scenes.find((scene) => scene.id === proposal.sceneId)?.order ?? 0;
  const affectedScenes = state.scenes.filter((scene) => scene.order > currentOrder && entity && new RegExp(`\\b${entity.aliases.concat(entity.name).join("| ")}\\b`, "i").test(scene.content) && scene.people.includes("lena")).map((scene) => ({ id: scene.id, title: scene.title, chapterId: scene.chapterId, quote: scene.content.split(/(?<=[.!?])\s/).find((sentence) => /silver key/i.test(sentence)) ?? scene.content, reason: `The same tracked object is used by Lena after being left in the ${proposal.value.toLowerCase()}.` }));
  return { changed: proposal, before, affectedScenes };
}
