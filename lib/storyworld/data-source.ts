import { createCanvasState } from "@/lib/story-canvas/fixtures";
import {
  readIndexedCanvasState,
  writeIndexedCanvasState,
} from "@/lib/story-canvas/persistence";
import type { ManuscriptDocument } from "@/lib/story-canvas/types";
import {
  demoEntityProjection,
  demoKeyBranch,
  demoKeyComparison,
  demoMainBranch,
  demoProjection,
} from "./fixtures";

export type StoryBranch = {
  id: string;
  name: string;
  parentId?: string;
  forkSceneId?: string;
  forkSceneTitle?: string;
  status: "ACTIVE" | "MERGED" | "ARCHIVED";
  active: boolean;
  changedScenes: number;
  openConsequences: number;
  mergeState: "unmerged" | "merged";
};
export type BranchCollection = {
  branches: StoryBranch[];
  activeBranchId: string;
  version: number;
  stale?: boolean;
};
export type StoryChange = {
  id: string;
  kind: "scene" | "state" | "knowledge" | "payoff";
  title: string;
  before: string;
  after: string;
  sceneId?: string;
  sceneTitle?: string;
  selected: boolean;
};
export type StoryConsequence = {
  id: string;
  title: string;
  detail: string;
  severity: "information" | "warning";
  sceneId?: string;
  sceneTitle?: string;
  resolved: boolean;
};
export type BranchComparison = {
  branchId: string;
  baseName: string;
  branchName: string;
  changedSentence: string;
  mainManuscript?: string;
  branchManuscript?: string;
  changes: StoryChange[];
  consequences: StoryConsequence[];
};
export type WorldNodeProjection = {
  id: string;
  type:
    | "chapter"
    | "scene"
    | "person"
    | "place"
    | "object"
    | "event"
    | "question"
    | "diagnostic"
    | "branch-difference";
  label: string;
  detail: string;
  meta: string;
  sourceSceneId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
export type WorldEdgeProjection = {
  id: string;
  source: string;
  target: string;
  type:
    | "appears-in"
    | "located-at"
    | "holds"
    | "owns"
    | "knows"
    | "believes"
    | "reveals"
    | "requires"
    | "sets-up"
    | "pays-off"
    | "conflicts-with"
    | "causes";
  label: string;
};
export type StoryworldProjection = {
  branchId: string;
  sequence: number;
  nodes: WorldNodeProjection[];
  edges: WorldEdgeProjection[];
  diagnostics: StoryConsequence[];
  bounds: { x: number; y: number; width: number; height: number };
  compilerVersion: string;
};
export type CompileResult = {
  branchId: string;
  consequences: StoryConsequence[];
  calculatedAt: string;
};
export type MergeResult = {
  mergeId: string;
  resultingVersion: number;
  message: string;
};
export type RevertResult = { resultingVersion: number; message: string };
export type EntityState = {
  entityId: string;
  facts: Array<{
    label: string;
    value: string;
    evidence: string;
    sceneId: string;
  }>;
};
export type StoryTimeProjection = {
  branchId: string;
  sequence: number;
  label: string;
  entityStates: EntityState[];
};
export type LoadWorldInput = {
  projectId: string;
  branchId?: string;
  sequence?: number;
};
export type CreateBranchInput = {
  projectId: string;
  name: string;
  sceneId: string;
  sceneTitle?: string;
  evidence?: string;
  blockId?: string;
  startOffset?: number;
  endOffset?: number;
  snapshotSequence?: number;
  forkManuscriptSequence?: number;
};
export type MergeBranchInput = {
  projectId: string;
  branchId: string;
  changeIds: string[];
  expectedVersion: number;
};
export type RevertMergeInput = {
  projectId: string;
  mergeId: string;
  expectedVersion: number;
};
export type EntityStateInput = {
  projectId: string;
  branchId: string;
  entityId: string;
  sequence?: number;
};
export type StoryTimeInput = {
  projectId: string;
  branchId: string;
  sequence: number;
};
export type BranchSceneDocument = {
  branchId: string;
  sceneId: string;
  manuscriptJson: ManuscriptDocument;
  manuscriptText: string;
  inherited: boolean;
  updatedAt: string;
};
export type MergePreview = {
  id: string;
  branchId: string;
  expectedVersion: number;
  changes: StoryChange[];
  createdAt: string;
};

export interface StoryworldDataSource {
  loadWorld(input: LoadWorldInput): Promise<StoryworldProjection>;
  loadBranches(projectId: string): Promise<BranchCollection>;
  loadBranch(branchId: string): Promise<StoryBranch>;
  selectBranch(branchId: string): Promise<void>;
  createBranch(input: CreateBranchInput): Promise<StoryBranch>;
  compareBranch(branchId: string): Promise<BranchComparison>;
  compileBranch(branchId: string): Promise<CompileResult>;
  loadBranchScene(
    branchId: string,
    sceneId: string,
  ): Promise<BranchSceneDocument>;
  saveBranchScene(value: BranchSceneDocument): Promise<BranchSceneDocument>;
  previewMerge(input: MergeBranchInput): Promise<MergePreview>;
  cancelMergePreview(previewId: string): Promise<void>;
  mergeBranch(input: MergeBranchInput): Promise<MergeResult>;
  revertMerge(input: RevertMergeInput): Promise<RevertResult>;
  loadEntityState(input: EntityStateInput): Promise<EntityState>;
  loadStoryTime(input: StoryTimeInput): Promise<StoryTimeProjection>;
}
export class StoryworldDataError extends Error {
  constructor(
    message: string,
    readonly code: "offline" | "unauthorized" | "unavailable" | "conflict",
    readonly retryable = true,
  ) {
    super(message);
  }
}

type Store = {
  schemaVersion: 2;
  version: number;
  activeBranchId: string;
  branches: StoryBranch[];
  comparisons: Record<string, BranchComparison>;
  branchScenes: Record<string, BranchSceneDocument>;
  mergePreviews: Record<string, MergePreview>;
  merges: Array<{ id: string; branchId: string; changeIds: string[] }>;
  undoState?: {
    mergeId: string;
    branchId: string;
    version: number;
    previousScene?: BranchSceneDocument;
  };
};
const memoryStores = new Map<string, Store>();
const legacyKey = (id: string) => `morrow:storyworld:${id}:v1`;
const DB = "morrow-storyworld";
const OBJECTS = "projects";
const seed = (): Store => ({
  schemaVersion: 2,
  version: 1,
  activeBranchId: "main",
  branches: [demoMainBranch, demoKeyBranch],
  comparisons: { [demoKeyBranch.id]: demoKeyComparison },
  branchScenes: {},
  mergePreviews: {},
  merges: [],
});
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(OBJECTS))
        request.result.createObjectStore(OBJECTS);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function getStore(projectId: string): Promise<Store> {
  if (typeof indexedDB === "undefined") {
    const stored = memoryStores.get(projectId);
    if (stored) return structuredClone(stored);
    const initial = seed();
    memoryStores.set(projectId, structuredClone(initial));
    return initial;
  }
  const database = await db();
  const stored = await new Promise<Store | undefined>((resolve, reject) => {
    const request = database
      .transaction(OBJECTS, "readonly")
      .objectStore(OBJECTS)
      .get(projectId);
    request.onsuccess = () => resolve(request.result as Store | undefined);
    request.onerror = () => reject(request.error);
  });
  if (stored?.schemaVersion === 2) return { ...seed(), ...stored };
  let migrated: Store | undefined;
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(legacyKey(projectId));
      if (raw) {
        const legacy = JSON.parse(raw) as Partial<Store>;
        migrated = {
          ...seed(),
          ...legacy,
          schemaVersion: 2,
          branchScenes: legacy.branchScenes ?? {},
          mergePreviews: legacy.mergePreviews ?? {},
          merges: legacy.merges ?? [],
        };
      }
    } catch {
      /* retain seed */
    }
  }
  const value = migrated ?? seed();
  await putStore(projectId, value);
  if (migrated && typeof localStorage !== "undefined") {
    const verified = await getStored(projectId);
    if (verified?.schemaVersion === 2)
      localStorage.removeItem(legacyKey(projectId));
  }
  return value;
}
async function getStored(projectId: string) {
  const database = await db();
  return new Promise<Store | undefined>((resolve, reject) => {
    const request = database
      .transaction(OBJECTS, "readonly")
      .objectStore(OBJECTS)
      .get(projectId);
    request.onsuccess = () => resolve(request.result as Store | undefined);
    request.onerror = () => reject(request.error);
  });
}
async function putStore(projectId: string, value: Store) {
  if (typeof indexedDB === "undefined") {
    memoryStores.set(projectId, structuredClone(value));
    return;
  }
  const database = await db();
  await new Promise<void>((resolve, reject) => {
    const tx = database.transaction(OBJECTS, "readwrite");
    tx.objectStore(OBJECTS).put(structuredClone(value), projectId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
const sceneDoc = (branchId: string, sceneId: string): BranchSceneDocument => {
  const scene = createCanvasState().scenes.find((item) => item.id === sceneId);
  if (!scene)
    throw new StoryworldDataError(
      "That source scene no longer exists.",
      "unavailable",
      false,
    );
  return {
    branchId,
    sceneId,
    manuscriptJson: scene.manuscriptJson,
    manuscriptText: scene.manuscriptText,
    inherited: true,
    updatedAt: new Date().toISOString(),
  };
};

export class DemoStoryworldDataSource implements StoryworldDataSource {
  constructor(private projectId: string) {}
  async loadWorld(input: LoadWorldInput) {
    const s = await getStore(this.projectId);
    return demoProjection(
      input.branchId ?? s.activeBranchId,
      input.sequence ?? 9,
    );
  }
  async loadBranches() {
    const s = await getStore(this.projectId);
    return {
      branches: s.branches,
      activeBranchId: s.activeBranchId,
      version: s.version,
    };
  }
  async loadBranch(id: string) {
    const item = (await getStore(this.projectId)).branches.find(
      (x) => x.id === id,
    );
    if (!item)
      throw new StoryworldDataError(
        "That story path no longer exists.",
        "unavailable",
        false,
      );
    return item;
  }
  async selectBranch(id: string) {
    const s = await getStore(this.projectId);
    if (!s.branches.some((branch) => branch.id === id))
      throw new StoryworldDataError(
        "That story path no longer exists.",
        "unavailable",
        false,
      );
    s.activeBranchId = id;
    s.branches = s.branches.map((branch) => ({
      ...branch,
      active: branch.id === id,
    }));
    await putStore(this.projectId, s);
  }
  async createBranch(input: CreateBranchInput) {
    const s = await getStore(this.projectId),
      id = `demo-${crypto.randomUUID()}`,
      branch: StoryBranch = {
        id,
        name: input.name || "Untitled path",
        parentId: s.activeBranchId,
        forkSceneId: input.sceneId,
        forkSceneTitle: input.sceneTitle,
        status: "ACTIVE",
        active: true,
        changedScenes: 0,
        openConsequences: 0,
        mergeState: "unmerged",
      };
    s.branches = s.branches
      .map((x) => ({ ...x, active: false }))
      .concat(branch);
    s.activeBranchId = id;
    s.version++;
    s.comparisons[id] = {
      branchId: id,
      baseName: "Main",
      branchName: branch.name,
      changedSentence: input.evidence || "No manuscript changes yet.",
      changes: [],
      consequences: [],
    };
    s.branchScenes[`${id}:${input.sceneId}`] = sceneDoc(id, input.sceneId);
    await putStore(this.projectId, s);
    return branch;
  }
  async compareBranch(id: string): Promise<BranchComparison> {
    const s = await getStore(this.projectId);
    return (
      s.comparisons[id] ?? {
        branchId: id,
        baseName: "Main",
        branchName: (await this.loadBranch(id)).name,
        changedSentence: "No manuscript changes yet.",
        changes: [],
        consequences: [],
      }
    );
  }
  async compileBranch(id: string): Promise<CompileResult> {
    return {
      branchId: id,
      consequences: (await this.compareBranch(id)).consequences,
      calculatedAt: new Date().toISOString(),
    };
  }
  async loadBranchScene(branchId: string, sceneId: string) {
    const s = await getStore(this.projectId);
    return (
      s.branchScenes[`${branchId}:${sceneId}`] ?? sceneDoc(branchId, sceneId)
    );
  }
  async saveBranchScene(value: BranchSceneDocument) {
    const s = await getStore(this.projectId),
      saved = {
        ...value,
        inherited: false,
        updatedAt: new Date().toISOString(),
      };
    s.branchScenes[`${value.branchId}:${value.sceneId}`] = saved;
    const comparison = s.comparisons[value.branchId];
    if (comparison) {
      const main = sceneDoc("main", value.sceneId).manuscriptText;
      comparison.mainManuscript = main;
      comparison.branchManuscript = value.manuscriptText;
      comparison.changedSentence = value.manuscriptText;
      comparison.changes = [
        {
          id: value.sceneId,
          kind: "scene",
          title: "Scene manuscript changed",
          before: main,
          after: value.manuscriptText,
          sceneId: value.sceneId,
          selected: true,
        },
      ];
    }
    s.branches = s.branches.map((branch) =>
      branch.id === value.branchId ? { ...branch, changedScenes: 1 } : branch,
    );
    s.version++;
    await putStore(this.projectId, s);
    return saved;
  }
  async previewMerge(input: MergeBranchInput): Promise<MergePreview> {
    const s = await getStore(this.projectId);
    if (s.version !== input.expectedVersion)
      throw new StoryworldDataError(
        "This story changed in another view.",
        "conflict",
      );
    const comparison = await this.compareBranch(input.branchId),
      preview: MergePreview = {
        id: `preview-${crypto.randomUUID()}`,
        branchId: input.branchId,
        expectedVersion: s.version,
        changes: comparison.changes.filter((change) =>
          input.changeIds.includes(change.id),
        ),
        createdAt: new Date().toISOString(),
      };
    s.mergePreviews[preview.id] = preview;
    await putStore(this.projectId, s);
    return preview;
  }
  async cancelMergePreview(id: string) {
    const s = await getStore(this.projectId);
    delete s.mergePreviews[id];
    await putStore(this.projectId, s);
  }
  async mergeBranch(input: MergeBranchInput) {
    const s = await getStore(this.projectId);
    if (s.version !== input.expectedVersion)
      throw new StoryworldDataError(
        "This story changed in another view.",
        "conflict",
      );
    const id = `merge-${crypto.randomUUID()}`;
    const selectedScene = input.changeIds
      .map((changeId) => s.branchScenes[`${input.branchId}:${changeId}`])
      .find(Boolean);
    let previousScene: BranchSceneDocument | undefined;
    if (selectedScene && typeof indexedDB !== "undefined") {
      const canvas =
        (await readIndexedCanvasState(this.projectId)) ?? createCanvasState();
      const current = canvas.scenes.find(
        (scene) => scene.id === selectedScene.sceneId,
      );
      if (current) {
        previousScene = {
          branchId: "main",
          sceneId: current.id,
          manuscriptJson: current.manuscriptJson,
          manuscriptText: current.manuscriptText,
          inherited: false,
          updatedAt: new Date().toISOString(),
        };
        const next = {
          ...current,
          manuscriptJson: selectedScene.manuscriptJson,
          manuscriptText: selectedScene.manuscriptText,
          content: selectedScene.manuscriptText,
          revision: current.revision + 1,
        };
        canvas.scenes = canvas.scenes.map((scene) =>
          scene.id === next.id ? next : scene,
        );
        canvas.project.scenes = canvas.scenes;
        await writeIndexedCanvasState(canvas);
        window.dispatchEvent(
          new CustomEvent("morrow:main-scene", { detail: next }),
        );
      }
    }
    s.version++;
    s.merges.push({ id, branchId: input.branchId, changeIds: input.changeIds });
    s.undoState = {
      mergeId: id,
      branchId: input.branchId,
      version: s.version,
      previousScene,
    };
    s.branches = s.branches.map((x) =>
      x.id === input.branchId
        ? { ...x, status: "MERGED", mergeState: "merged" }
        : x,
    );
    s.mergePreviews = {};
    await putStore(this.projectId, s);
    return {
      mergeId: id,
      resultingVersion: s.version,
      message:
        "The selected story changes were merged. You can undo this safely.",
    };
  }
  async revertMerge(input: RevertMergeInput) {
    const s = await getStore(this.projectId);
    if (
      s.version !== input.expectedVersion ||
      s.undoState?.mergeId !== input.mergeId
    )
      throw new StoryworldDataError(
        "The story changed after this merge.",
        "conflict",
      );
    const previous = s.undoState.previousScene;
    if (previous && typeof indexedDB !== "undefined") {
      const canvas =
        (await readIndexedCanvasState(this.projectId)) ?? createCanvasState();
      const current = canvas.scenes.find(
        (scene) => scene.id === previous.sceneId,
      );
      if (current) {
        const restored = {
          ...current,
          manuscriptJson: previous.manuscriptJson,
          manuscriptText: previous.manuscriptText,
          content: previous.manuscriptText,
          revision: current.revision + 1,
        };
        canvas.scenes = canvas.scenes.map((scene) =>
          scene.id === restored.id ? restored : scene,
        );
        canvas.project.scenes = canvas.scenes;
        await writeIndexedCanvasState(canvas);
        window.dispatchEvent(
          new CustomEvent("morrow:main-scene", { detail: restored }),
        );
      }
    }
    s.version++;
    s.branches = s.branches.map((x) =>
      x.id === s.undoState?.branchId
        ? { ...x, status: "ACTIVE", mergeState: "unmerged" }
        : x,
    );
    s.merges = s.merges.filter((item) => item.id !== input.mergeId);
    delete s.undoState;
    await putStore(this.projectId, s);
    return {
      resultingVersion: s.version,
      message: "Merge undone. The alternate path is still available.",
    };
  }
  async loadEntityState(input: EntityStateInput) {
    try {
      return demoEntityProjection(
        input.entityId,
        input.branchId,
        input.sequence,
      );
    } catch {
      throw new StoryworldDataError(
        "That story record no longer exists.",
        "unavailable",
        false,
      );
    }
  }
  async loadStoryTime(input: StoryTimeInput) {
    return {
      branchId: input.branchId,
      sequence: input.sequence,
      label: `Story point ${input.sequence}`,
      entityStates: createCanvasState().entities.map((entity) =>
        demoEntityProjection(entity.id, input.branchId, input.sequence),
      ),
    };
  }
}

async function request<T>(
  url: string,
  init?: RequestInit,
  retries = 2,
): Promise<T> {
  if (typeof navigator !== "undefined" && !navigator.onLine)
    throw new StoryworldDataError(
      "You are offline. Your manuscript is safe.",
      "offline",
    );
  try {
    const response = await fetch(url, {
        ...init,
        headers: {
          "content-type": "application/json",
          ...(init?.headers || {}),
        },
      }),
      body = await response.json().catch(() => ({}));
    if (response.ok) return body as T;
    if (response.status === 409)
      throw new StoryworldDataError(
        "This story changed in another view.",
        "conflict",
      );
    if (response.status === 401)
      throw new StoryworldDataError(
        "Sign in again to view branch history.",
        "unauthorized",
        false,
      );
    if (retries > 0 && response.status >= 500)
      return request<T>(url, init, retries - 1);
    throw new StoryworldDataError(
      "Branch history is temporarily unavailable.",
      "unavailable",
    );
  } catch (error) {
    if (error instanceof StoryworldDataError) throw error;
    if (retries > 0) return request<T>(url, init, retries - 1);
    throw new StoryworldDataError(
      "Branch history is temporarily unavailable.",
      "unavailable",
    );
  }
}
type ApiBranch = {
  id: string;
  name: string;
  parentId?: string;
  forkSceneId?: string;
  status: "ACTIVE" | "MERGED" | "ARCHIVED";
  active: boolean;
  _count?: { sceneOverrides: number; diagnostics: number };
};
const human = (x: ApiBranch): StoryBranch => ({
  id: x.id,
  name: x.name,
  parentId: x.parentId,
  forkSceneId: x.forkSceneId,
  status: x.status,
  active: x.active,
  changedScenes: x._count?.sceneOverrides ?? 0,
  openConsequences: x._count?.diagnostics ?? 0,
  mergeState: x.status === "MERGED" ? "merged" : "unmerged",
});
export class ProductionStoryworldDataSource implements StoryworldDataSource {
  constructor(private projectId: string) {}
  loadWorld(input: LoadWorldInput) {
    return request<StoryworldProjection>(
      `/api/projects/${input.projectId}/storyworld/branches/${input.branchId || "main"}/projection${input.sequence === undefined ? "" : `?sequence=${input.sequence}`}`,
    );
  }
  async loadBranches() {
    const r = await request<{ branches: ApiBranch[]; universeVersion: number }>(
        `/api/projects/${this.projectId}/storyworld/branches`,
      ),
      branches = r.branches.map(human);
    return {
      branches,
      activeBranchId:
        branches.find((x) => x.active)?.id || branches[0]?.id || "",
      version: r.universeVersion,
    };
  }
  async loadBranch(id: string) {
    const item = (await this.loadBranches()).branches.find((x) => x.id === id);
    if (!item)
      throw new StoryworldDataError(
        "That story path no longer exists.",
        "unavailable",
        false,
      );
    return item;
  }
  async selectBranch(id: string) {
    await request(
      `/api/projects/${this.projectId}/storyworld/branches/${id}/select`,
      { method: "POST" },
    );
  }
  async createBranch(input: CreateBranchInput) {
    const r = await request<{ branch: ApiBranch }>(
      `/api/projects/${this.projectId}/storyworld/branches`,
      { method: "POST", body: JSON.stringify(input) },
    );
    return human(r.branch);
  }
  async compareBranch(id: string): Promise<BranchComparison> {
    const response = await request<{
      branchId: string;
      differences: Array<{
        id: string;
        kind: string;
        recordType: string;
        recordId: string;
        main?: unknown;
        branch?: unknown;
      }>;
      sceneChanges: Array<{ sceneId: string }>;
      summary: { introducedRisks: number };
    }>(`/api/projects/${this.projectId}/storyworld/branches/${id}/compare`);
    const branch = await this.loadBranch(id);
    return {
      branchId: id,
      baseName: "Main",
      branchName: branch.name,
      changedSentence: response.sceneChanges.length
        ? `${response.sceneChanges.length} changed scene${response.sceneChanges.length === 1 ? "" : "s"}`
        : "No manuscript changes yet.",
      changes: response.differences.map((difference) => ({
        id: difference.recordId,
        kind:
          difference.recordType === "DIAGNOSTIC"
            ? "payoff"
            : difference.recordType === "ENTITY_STATE"
              ? "state"
              : "scene",
        title: `${difference.recordType.replaceAll("_", " ").toLowerCase()} ${difference.kind.toLowerCase()}`,
        before:
          difference.main === undefined
            ? "Not established"
            : JSON.stringify(difference.main),
        after:
          difference.branch === undefined
            ? "Removed in branch"
            : JSON.stringify(difference.branch),
        selected: difference.recordType !== "DIAGNOSTIC",
      })),
      consequences: response.differences
        .filter((difference) => difference.recordType === "DIAGNOSTIC")
        .map((difference) => ({
          id: difference.id,
          title: "Story consequence requires review",
          detail: `${difference.kind.replaceAll("_", " ").toLowerCase()} in this branch`,
          severity: "warning",
          resolved: false,
        })),
    };
  }
  async compileBranch(id: string): Promise<CompileResult> {
    const response = await request<{
      diagnostics: Array<{
        id: string;
        title: string;
        explanation: string;
        severity: string;
        sourceSceneId?: string;
        affectedSceneId?: string;
      }>;
    }>(`/api/projects/${this.projectId}/storyworld/branches/${id}/compile`, {
      method: "POST",
      body: JSON.stringify({ trigger: "MANUAL" }),
    });
    return {
      branchId: id,
      consequences: response.diagnostics.map((item) => ({
        id: item.id,
        title: item.title,
        detail: item.explanation,
        severity: item.severity === "INFO" ? "information" : "warning",
        sceneId: item.affectedSceneId ?? item.sourceSceneId,
        resolved: false,
      })),
      calculatedAt: new Date().toISOString(),
    };
  }
  loadBranchScene(branchId: string, sceneId: string) {
    return request<BranchSceneDocument>(
      `/api/projects/${this.projectId}/storyworld/branches/${branchId}/scenes/${sceneId}`,
    );
  }
  saveBranchScene(value: BranchSceneDocument) {
    return request<BranchSceneDocument>(
      `/api/projects/${this.projectId}/storyworld/branches/${value.branchId}/scenes/${value.sceneId}`,
      { method: "PUT", body: JSON.stringify(value) },
    );
  }
  async previewMerge(input: MergeBranchInput): Promise<MergePreview> {
    const comparison = await this.compareBranch(input.branchId);
    return {
      id: `preview:${input.branchId}:${input.expectedVersion}`,
      branchId: input.branchId,
      expectedVersion: input.expectedVersion,
      changes: comparison.changes.filter((change) =>
        input.changeIds.includes(change.id),
      ),
      createdAt: new Date().toISOString(),
    };
  }
  async cancelMergePreview() {
    // Production previews are derived read-only from the current version.
  }
  async mergeBranch(input: MergeBranchInput) {
    const r = await request<{
      mergeCommitId: string;
      resultingVersion: number;
    }>(
      `/api/projects/${this.projectId}/storyworld/branches/${input.branchId}/merge`,
      {
        method: "POST",
        body: JSON.stringify({
          expectedUniverseVersion: input.expectedVersion,
          selectedChanges: { sceneIds: input.changeIds, eventIds: [] },
        }),
      },
    );
    return {
      mergeId: r.mergeCommitId,
      resultingVersion: r.resultingVersion,
      message:
        "The selected story changes were merged. You can undo this safely.",
    };
  }
  async revertMerge(input: RevertMergeInput) {
    const r = await request<{ resultingVersion: number }>(
      `/api/projects/${this.projectId}/storyworld/commits/${input.mergeId}/revert`,
      {
        method: "POST",
        body: JSON.stringify({
          expectedUniverseVersion: input.expectedVersion,
        }),
      },
    );
    return {
      resultingVersion: r.resultingVersion,
      message: "Merge undone. The alternate path is still available.",
    };
  }
  async loadEntityState(input: EntityStateInput) {
    const response = await request<{
      entity: { id: string; name: string };
      projection: { stateJson: Record<string, unknown> } | null;
      references?: Record<string, string>;
      evidence?: Array<{ exactQuote?: string; sceneId?: string }>;
    }>(
      `/api/projects/${input.projectId}/storyworld/entities/${input.entityId}/state?branchId=${encodeURIComponent(input.branchId)}${input.sequence === undefined ? "" : `&sequence=${input.sequence}`}`,
    );
    const state = response.projection?.stateJson ?? {};
    const references = response.references ?? {};
    const evidence = response.evidence?.[0];
    const facts = Object.entries(state)
      .filter(
        ([key, value]) =>
          !["entityId", "introduced", "lastEventId"].includes(key) &&
          value !== undefined &&
          value !== null &&
          (typeof value !== "object" || Object.keys(value).length > 0),
      )
      .map(([key, value]) => {
        const raw = typeof value === "string" ? value : JSON.stringify(value);
        return {
          label: key
            .replaceAll(/([A-Z])/g, " $1")
            .replaceAll("_", " ")
            .trim(),
          value: references[raw] ?? raw,
          evidence: evidence?.exactQuote ?? "Confirmed Storyworld state",
          sceneId: evidence?.sceneId ?? "",
        };
      });
    return { entityId: response.entity.id, facts };
  }
  async loadStoryTime(input: StoryTimeInput) {
    const projection = await request<
      StoryworldProjection & {
        entityStates?: Array<{ entityId: string }>;
      }
    >(
      `/api/projects/${input.projectId}/storyworld/branches/${input.branchId}/projection?sequence=${input.sequence}`,
    );
    const entityStates = await Promise.all(
      (projection.entityStates ?? []).map((item) =>
        this.loadEntityState({ ...input, entityId: item.entityId }),
      ),
    );
    return {
      branchId: input.branchId,
      sequence: projection.sequence,
      label: `Story point ${projection.sequence}`,
      entityStates,
    };
  }
}
