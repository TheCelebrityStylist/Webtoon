import type { CanvasState, StoryObservation } from "./types";

export type StoryImpact = { changed: StoryObservation; before?: StoryObservation; affectedScenes: Array<{ id: string; title: string; chapterId: string; quote: string; reason: string }> };

export function calculateImpact(state: CanvasState, proposal: StoryObservation): StoryImpact | null {
  if (proposal.predicate !== "location" && proposal.predicate !== "holder") return null;
  const before = [...state.observations].reverse().find((item) => item.subjectId === proposal.subjectId && item.status === "confirmed" && (item.predicate === "holder" || item.predicate === "location"));
  if (!before || before.value === proposal.value) return null;
  const entity = state.entities.find((item) => item.id === proposal.subjectId);
  const currentOrder = state.scenes.find((scene) => scene.id === proposal.sceneId)?.order ?? 0;
  const aliases = entity?.aliases.concat(entity.name).map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) ?? [];
  const matcher = aliases.length ? new RegExp(`\\b(?:${aliases.join("|")})\\b`, "i") : null;
  const affectedScenes = state.scenes
    .filter((scene) => scene.order > currentOrder && matcher?.test(scene.content))
    .map((scene) => ({
      id: scene.id,
      title: scene.title,
      chapterId: scene.chapterId,
      quote: scene.content.split(/(?<=[.!?])\s/).find((sentence) => matcher?.test(sentence)) ?? scene.content,
      reason: `${entity?.name ?? "This record"} appears after its confirmed ${proposal.predicate} changed to ${proposal.value}. Review whether the later evidence still has a supported path.`,
    }));
  return { changed: proposal, before, affectedScenes };
}
