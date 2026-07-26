import { createCanvasState } from "./fixtures";
import { LocalDemoStoryAnalyzer } from "./local-analyzer";
import { applyStructureCommand, createChapterRecord, createPartRecord, createSceneRecord } from "./structure";
import { readIndexedCanvasState, writeIndexedCanvasState } from "./persistence";
import type { CanvasScene, CanonCommit, ConfirmProposalInput, CreateChapterInput, CreateEntityInput, CreatePartInput, CreateSceneInput, StoryAnalysisInput, StoryAnalysisResult, StoryChapter, StoryEntity, StoryPart, StoryWorkspaceDataSource, StructureCommand, StructureResult, UpdateEntityInput } from "./types";

const analyzer = new LocalDemoStoryAnalyzer();
const entityId = (name: string, type: string) => `${type}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;

export class LocalDemoStoryDataSource implements StoryWorkspaceDataSource {
  readonly mode = "demo" as const;
  private state = createCanvasState();
  async loadProject(projectId: string) { this.state = await readIndexedCanvasState(projectId) ?? createCanvasState(); return structuredClone(this.state); }
  private async save() { await writeIndexedCanvasState(this.state); }
  async saveScene(scene: CanvasScene) { this.state.project.scenes = this.state.project.scenes.map((item) => item.id === scene.id ? scene : item); this.state.scenes = this.state.project.scenes; await this.save(); return scene; }
  async createPart(input: CreatePartInput) { const result = createPartRecord(this.state.project, input.title, input.position); this.state.project = result.project; await this.save(); return result.part; }
  async createChapter(input: CreateChapterInput) { const result = createChapterRecord(this.state.project, input.title, input.partId, input.position); this.state.project = result.project; this.state.scenes = result.project.scenes; await this.save(); return result.chapter; }
  async createScene(input: CreateSceneInput) { const result = createSceneRecord(this.state.project, input.chapterId, input.title, input.position); this.state.project = result.project; this.state.scenes = result.project.scenes; await this.save(); return result.scene; }
  async updateStructure(command: StructureCommand): Promise<StructureResult> { const result = applyStructureCommand(this.state.project, command); this.state.project = result.project; this.state.scenes = result.project.scenes; await this.save(); return result; }
  async createEntity(input: CreateEntityInput) { const entity: StoryEntity = { id: entityId(input.name, input.type), name: input.name, type: input.type, aliases: [], appearances: input.sceneId ? [input.sceneId] : [], sceneIds: input.sceneId ? [input.sceneId] : [], role: input.role, pronouns: input.pronouns, description: input.description, currentLocation: input.currentLocation, currentHolder: input.currentHolder, currentOwner: input.currentOwner, atmosphere: input.atmosphere, status: "active", sourceCount: input.sceneId ? 1 : 0 }; this.state.entities.push(entity); await this.save(); return entity; }
  async updateEntity(input: UpdateEntityInput) { const current = this.state.entities.find((item) => item.id === input.entityId); if (!current) throw new Error("Entity not found"); const entity = { ...current, ...input, id: current.id, type: input.type ?? current.type, aliases: current.aliases, appearances: current.appearances }; this.state.entities = this.state.entities.map((item) => item.id === entity.id ? entity : item); await this.save(); return entity; }
  async analyzeBlocks(input: StoryAnalysisInput): Promise<StoryAnalysisResult> { const scene = this.state.scenes.find((item) => item.id === input.sceneId); if (!scene) throw new Error("Scene not found"); return { runId: `local-${Date.now()}`, revision: input.revision, canonVersion: this.state.observations.filter((item) => item.status === "confirmed").length, proposals: input.blocks.flatMap((block) => analyzer.analyze({ scene, paragraphId: block.id, text: block.text, entities: this.state.entities })) }; }
  async confirmProposals(input: ConfirmProposalInput): Promise<CanonCommit> { return { id: `local-commit-${Date.now()}`, resultingVersion: input.expectedCanonVersion + 1, proposalIds: input.proposalIds }; }
  async revertCommit(commitId: string): Promise<CanonCommit> { return { id: commitId, resultingVersion: Math.max(0, this.state.observations.filter((item) => item.status === "confirmed").length - 1), proposalIds: [], reverted: true }; }
}

async function json<T>(url: string, init?: RequestInit): Promise<T> { const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } }); const body = await response.json(); if (!response.ok) throw Object.assign(new Error(body.error ?? "Request failed"), { status: response.status, body }); return body as T; }
const sha256 = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");
export class ProductionStoryDataSource implements StoryWorkspaceDataSource {
  readonly mode = "production" as const;
  constructor(private projectId: string, private snapshot?: ReturnType<typeof createCanvasState>) {}
  async loadProject() {
    this.snapshot = await json<ReturnType<typeof createCanvasState>>(`/api/projects/${this.projectId}/workspace`);
    return this.snapshot;
  }
  saveScene(scene: CanvasScene) { return json<CanvasScene>(`/api/projects/${this.projectId}/scenes/${scene.id}`, { method: "PUT", headers: { "x-morrow-mutation-id": crypto.randomUUID() }, body: JSON.stringify({ revision: scene.revision, document: scene.manuscriptJson, text: scene.manuscriptText }) }).then((result) => { const saved = { ...scene, ...result }; if (this.snapshot) { this.snapshot.scenes = this.snapshot.scenes.map((item) => item.id === saved.id ? saved : item); this.snapshot.project.scenes = this.snapshot.scenes; } return saved; }); }
  createPart(input: CreatePartInput) { return json<StoryPart>(`/api/projects/${this.projectId}/structure`, { method: "POST", body: JSON.stringify({ operation: "create-part", ...input }) }); }
  createChapter(input: CreateChapterInput) { return json<StoryChapter>(`/api/projects/${this.projectId}/structure`, { method: "POST", body: JSON.stringify({ operation: "create-chapter", ...input }) }); }
  createScene(input: CreateSceneInput) { return json<CanvasScene>(`/api/projects/${this.projectId}/structure`, { method: "POST", body: JSON.stringify({ operation: "create-scene", ...input }) }); }
  updateStructure(command: StructureCommand) { return json<StructureResult>(`/api/projects/${this.projectId}/structure`, { method: "PATCH", body: JSON.stringify(command) }); }
  createEntity(input: CreateEntityInput) { return json<StoryEntity>(`/api/projects/${this.projectId}/story-library/entities`, { method: "POST", body: JSON.stringify(input) }); }
  updateEntity(input: UpdateEntityInput) { return json<StoryEntity>(`/api/projects/${this.projectId}/story-library/entities/${input.entityId}`, { method: "PATCH", body: JSON.stringify(input) }); }
  async analyzeBlocks(input: StoryAnalysisInput) {
    const state = this.snapshot;
    const manuscriptHash = await sha256(input.blocks.map((block) => `${block.id}\0${block.text}`).join("\n"));
    const raw = await json<{ runId: string; revision: number; canonVersion: number; manuscriptHash: string; warnings?: string[]; proposals: Array<{ id: string; kind: string; entityId?: string; entityName?: string; entityType?: string; property?: string; afterValue?: unknown; evidence: { blockId: string; quote: string; startOffset: number; endOffset: number } }> }>(`/api/projects/${this.projectId}/scenes/${input.sceneId}/story-pulse`, { method: "POST", body: JSON.stringify({ projectId: this.projectId, sceneId: input.sceneId, revision: input.revision, requestId: crypto.randomUUID(), manuscriptHash, blocks: input.blocks.map((block, order) => ({ ...block, adjacent: [], order })), candidateEntities: (state?.entities ?? []).map((entity) => ({ id: entity.id, name: entity.name, aliases: entity.aliases, type: entity.type === "person" ? "CHARACTER" : entity.type.toUpperCase() })), confirmedFacts: (state?.observations ?? []).filter((item) => item.status === "confirmed").map((item) => ({ id: item.id, entityId: item.subjectId, predicate: item.predicate, value: item.value })) }) });
    const proposals = raw.proposals.map((proposal) => ({ id: proposal.id, subjectId: proposal.entityId ?? proposal.entityName ?? proposal.id, predicate: proposal.property === "holder" ? "holder" as const : proposal.property === "location" ? "location" as const : proposal.kind === "EVENT" ? "entered" as const : "exists" as const, value: String(proposal.afterValue ?? proposal.entityName ?? "exists"), sceneId: input.sceneId, paragraphId: proposal.evidence.blockId, quote: proposal.evidence.quote, start: proposal.evidence.startOffset, end: proposal.evidence.endOffset, status: "proposed" as const, kind: proposal.entityType === "CHARACTER" ? "person" as const : proposal.entityType === "PLACE" ? "place" as const : proposal.entityType === "OBJECT" ? "object" as const : proposal.entityType === "EVENT" ? "event" as const : "state" as const, title: proposal.kind === "WARNING" ? `Review ${proposal.entityName ?? "story fact"}` : `Track ${proposal.entityName ?? proposal.property ?? "story fact"}` }));
    return { runId: raw.runId, revision: raw.revision, canonVersion: raw.canonVersion, manuscriptHash: raw.manuscriptHash, proposals, warning: raw.warnings?.join(" ") };
  }
  confirmProposals(input: ConfirmProposalInput) { return json<CanonCommit>(`/api/projects/${this.projectId}/scenes/${input.sceneId}/story-pulse/${input.runId}/confirm`, { method: "POST", body: JSON.stringify({ proposalIds: input.proposalIds, revision: input.expectedRevision, manuscriptHash: input.manuscriptHash, expectedVersion: input.expectedCanonVersion }) }); }
  revertCommit(commitId: string) { return json<CanonCommit>(`/api/projects/${this.projectId}/canon/commits/${commitId}/revert`, { method: "POST" }); }
}
