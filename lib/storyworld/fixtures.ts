import { createCanvasState } from "@/lib/story-canvas/fixtures";
import { STORYWORLD_COMPILER_VERSION } from "./compiler/compiler-version";
import type {
  BranchComparison,
  EntityState,
  StoryBranch,
  StoryworldProjection,
  WorldEdgeProjection,
} from "./data-source";

export const demoMainBranch: StoryBranch = {
  id: "main",
  name: "Main",
  status: "ACTIVE",
  active: true,
  changedScenes: 0,
  openConsequences: 0,
  mergeState: "unmerged",
};

export const demoKeyBranch: StoryBranch = {
  id: "key-left-behind",
  name: "Key left behind",
  parentId: "main",
  forkSceneId: "scene-3",
  forkSceneTitle: "The conversation room",
  status: "ACTIVE",
  active: false,
  changedScenes: 1,
  openConsequences: 2,
  mergeState: "unmerged",
};

export const demoKeyComparison: BranchComparison = {
  branchId: demoKeyBranch.id,
  baseName: "Main",
  branchName: demoKeyBranch.name,
  changedSentence: "Lena leaves the Silver Key beside the portrait.",
  changes: [
    {
      id: "key-location",
      kind: "state",
      title: "Silver Key location changed",
      before: "Lena’s hand",
      after: "River",
      sceneTitle: "The conversation room",
      selected: true,
    },
    {
      id: "tomas-knowledge",
      kind: "knowledge",
      title: "Tomas does not learn about the key",
      before: "Tomas knows Lena has it",
      after: "Tomas remains unaware",
      selected: true,
    },
    {
      id: "archive-payoff",
      kind: "payoff",
      title: "The archive-door payoff is unresolved",
      before: "The door can be opened",
      after: "The key is missing",
      selected: true,
    },
  ],
  consequences: [
    {
      id: "door",
      title: "The archive door can no longer open",
      detail: "Repair by returning the key before the flooded archive scene.",
      severity: "warning",
      resolved: false,
    },
    {
      id: "tomas",
      title: "Tomas cannot act on knowledge he never received",
      detail: "Give Tomas another supported way to discover the key.",
      severity: "warning",
      resolved: false,
    },
  ],
};

export function demoProjection(
  branchId: string,
  sequence = 9,
): StoryworldProjection {
  const state = createCanvasState();
  const scenes = state.scenes.filter((scene) => scene.order < sequence);
  const chapterNodes = state.project.chapters.map((chapter, index) => ({
    id: `chapter:${chapter.id}`,
    type: "chapter" as const,
    label: chapter.title,
    detail: `Chapter ${index + 1}`,
    meta: `${chapter.sceneIds.length} scenes`,
    x: 80 + index * 760,
    y: 70,
    width: 700,
    height: 82,
  }));
  const sceneNodes = scenes.map((scene) => ({
    id: `scene:${scene.id}`,
    type: "scene" as const,
    label: scene.title,
    detail: scene.location,
    meta: `Story point ${scene.order + 1}`,
    sourceSceneId: scene.id,
    x: 150 + Math.floor(scene.order / 3) * 760 + (scene.order % 3) * 205,
    y: 360,
    width: 185,
    height: 110,
  }));
  const entityNodes = state.entities.map((entity, index) => {
    const first = scenes.find((scene) => entity.appearances.includes(scene.id));
    const sceneIndex = Math.max(0, first?.order ?? 0);
    return {
      id: `entity:${entity.id}`,
      type: entity.type as "person" | "place" | "object",
      label: entity.name,
      detail:
        entity.currentHolder ??
        entity.currentLocation ??
        entity.state ??
        "Supported by manuscript",
      meta: `${entity.appearances.length} appearances`,
      sourceSceneId: first?.id,
      x: 155 + Math.floor(sceneIndex / 3) * 760 + (sceneIndex % 3) * 205,
      y:
        entity.type === "person"
          ? 190 + (index % 2) * 72
          : 500 + (index % 3) * 70,
      width: 175,
      height: 76,
    };
  });
  const nodes = [...chapterNodes, ...sceneNodes, ...entityNodes];
  const known = new Set(nodes.map((node) => node.id));
  const edges: WorldEdgeProjection[] = state.entities.flatMap((entity) =>
    entity.appearances
      .filter((id) => known.has(`scene:${id}`))
      .map((id) => ({
        id: `appearance:${entity.id}:${id}`,
        source: `entity:${entity.id}`,
        target: `scene:${id}`,
        type: "appears-in" as const,
        label: "appears in",
      })),
  );
  edges.push(
    {
      id: "key-holder",
      source: "entity:lena",
      target: "entity:silver-key",
      type: "holds",
      label: "holds",
    },
    {
      id: "key-archive",
      source: "entity:silver-key",
      target: "scene:archive-door",
      type: "requires",
      label: "required for",
    },
    {
      id: "river-key",
      source: "scene:river-bank",
      target: "scene:archive-door",
      type: "causes",
      label: "changes what follows",
    },
  );
  const maxX = Math.max(...nodes.map((node) => node.x + node.width), 1200);
  const maxY = Math.max(...nodes.map((node) => node.y + node.height), 700);
  return {
    branchId,
    sequence,
    nodes,
    edges,
    diagnostics: branchId === "main" ? [] : demoKeyComparison.consequences,
    bounds: { x: 0, y: 0, width: maxX + 80, height: maxY + 80 },
    compilerVersion: STORYWORLD_COMPILER_VERSION,
  };
}

export function demoEntityProjection(
  entityId: string,
  branchId: string,
  sequence = 9,
): EntityState {
  const state = createCanvasState();
  const entity = state.entities.find((item) => item.id === entityId);
  if (!entity) throw new Error("That story record no longer exists.");
  const branchValue =
    branchId !== "main" && entityId === "silver-key"
      ? "At the river"
      : (entity.currentHolder ??
        entity.currentLocation ??
        entity.state ??
        "Established");
  const appearances = state.scenes.filter(
    (scene) => scene.order < sequence && entity.appearances.includes(scene.id),
  );
  return {
    entityId,
    facts: [
      {
        label: "At this story point",
        value: branchValue,
        evidence:
          appearances.at(-1)?.manuscriptText ??
          entity.sourceEvidence ??
          "Confirmed story record",
        sceneId: appearances.at(-1)?.id ?? entity.appearances[0],
      },
      {
        label: "Previous state",
        value: appearances.at(-2)?.location ?? "Not yet established",
        evidence: appearances.at(-2)?.manuscriptText ?? "No earlier appearance",
        sceneId: appearances.at(-2)?.id ?? entity.appearances[0],
      },
      {
        label: "Next supported appearance",
        value:
          entity.appearances.find(
            (id) => !appearances.some((scene) => scene.id === id),
          ) ?? "None",
        evidence: "Derived from story order",
        sceneId:
          entity.appearances.find(
            (id) => !appearances.some((scene) => scene.id === id),
          ) ??
          entity.appearances.at(-1) ??
          "",
      },
    ],
  };
}
