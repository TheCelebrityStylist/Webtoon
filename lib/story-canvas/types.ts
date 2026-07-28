export type CanvasMode = "write" | "world" | "branches";
export type EntityType = "person" | "place" | "object" | "event" | "faction" | "question";
export type ProjectType = "NOVEL" | "BOOK_SERIES" | "SCREENPLAY" | "TV_SERIES" | "SERIAL_FICTION" | "WEBTOON" | "COMIC" | "GAME_NARRATIVE" | "CUSTOM";
export type RecordStatus = "draft" | "active" | "archived";

export type StoryPart = { id: string; projectId: string; title: string; position: number; chapterIds: string[]; collapsed?: boolean; status: RecordStatus };
export type StoryChapter = { id: string; projectId: string; partId?: string; title: string; position: number; summary: string; status: RecordStatus; sceneIds: string[]; collapsed?: boolean; createdAt: string; updatedAt: string };
export type CanvasScene = {
  id: string; chapterId: string; title: string; content: string; location: string; people: string[]; objects: string[]; summary: string; order: number;
  position: number; status: RecordStatus; pointOfViewEntityId?: string; locationEntityId?: string; wordCount: number; lastEditedAt: string; revision: number;
};
export type StoryProject = { id: string; title: string; type: ProjectType; premise: string; language: string; parts: StoryPart[]; chapters: StoryChapter[]; scenes: CanvasScene[]; createdAt: string; updatedAt: string };

export type StoryEntity = {
  id: string; name: string; type: EntityType; aliases: string[]; currentLocation?: string; currentHolder?: string; currentOwner?: string; state?: string;
  role?: string; pronouns?: string; description?: string; atmosphere?: string; parentId?: string; importance?: string; appearances: string[]; sourceCount?: number; sceneIds?: string[]; status?: RecordStatus;
};
export type StoryObservation = { id: string; subjectId: string; predicate: "exists" | "location" | "holder" | "entered"; value: string; sceneId: string; paragraphId: string; quote: string; start: number; end: number; status: "proposed" | "confirmed" | "dismissed" | "changed"; kind: EntityType | "state"; title: string };
export type ReviewFinding = { id: string; sceneId: string; quote: string; issue: string; reason: string; relatedQuote: string; status: "open" | "accepted" | "intentional" | "dismissed" };
export type SyncStatus = "not-connected" | "connecting" | "connected" | "local-changes" | "syncing" | "synced" | "google-changed" | "conflict" | "offline" | "error";
export type GoogleWorkspaceState = { status: SyncStatus; accountEmail?: string; grantedServices: string[]; documentId?: string; documentName?: string; documentUrl?: string; latestRevisionId?: string; driveVersion?: string; modifiedTime?: string; lastSyncedAt?: string; lastSyncedCanonVersion?: number; lastSyncedManuscriptRevision?: number; workbookId?: string; externalChange?: GoogleDocumentComparison };
export type GoogleDocumentBlock = { id: string; text: string; style: string; kind: "heading" | "paragraph" | "rule"; included: boolean };
export type GoogleImportPreview = { documentId: string; title: string; blocks: GoogleDocumentBlock[]; project: StoryProject; sourceModifiedTime?: string };
export type GoogleDocumentComparison = { documentId: string; baseRevision?: string; googleRevision: string; localRevision: number; status: "google-only" | "morrow-only" | "conflict" | "unchanged"; scenes: Array<{ sceneId: string; title: string; morrow: string; google: string; result?: string }> };

export type CanvasState = {
  version: 3; project: StoryProject; projectTitle: string; currentSceneId: string; mode: CanvasMode; outlineExpanded: boolean; focusMode: boolean;
  scenes: CanvasScene[]; entities: StoryEntity[]; observations: StoryObservation[]; dismissedObservationKeys: string[]; findings: ReviewFinding[];
  selectedEntityId?: string; wordTarget: number; pulseEnabled: boolean; reducedMotion: boolean; textSize: number; sync: GoogleWorkspaceState; dataMode: "demo" | "production";
};

export type CreatePartInput = { projectId: string; title?: string; position?: number };
export type CreateChapterInput = { projectId: string; title?: string; partId?: string; position?: number };
export type CreateSceneInput = { projectId: string; chapterId: string; title?: string; position?: number };
export type CreateEntityInput = { projectId: string; name: string; type: EntityType; sceneId?: string; role?: string; pronouns?: string; description?: string; currentLocation?: string; currentHolder?: string; currentOwner?: string; atmosphere?: string };
export type UpdateEntityInput = Partial<CreateEntityInput> & { projectId: string; entityId: string };
export type StructureCommand = { projectId: string; type: "move-chapter" | "duplicate-chapter" | "archive-chapter" | "restore-chapter" | "delete-chapter" | "rename-chapter" | "move-scene" | "duplicate-scene" | "archive-scene" | "restore-scene" | "delete-scene" | "rename-scene" | "split-scene"; id: string; direction?: "before" | "after" | "earlier" | "later"; targetId?: string; value?: string; position?: number };
export type StructureResult = { project: StoryProject; selectedSceneId?: string };
export type StoryAnalysisInput = { projectId: string; sceneId: string; revision: number; blocks: Array<{ id: string; text: string }>; canonVersion?: number };
export type StoryAnalysisResult = { runId: string; revision: number; canonVersion: number; proposals: StoryObservation[]; manuscriptHash?: string; warning?: string };
export type ConfirmProposalInput = { projectId: string; sceneId: string; runId: string; proposalIds: string[]; expectedRevision: number; expectedCanonVersion: number; manuscriptHash?: string };
export type CanonCommit = { id: string; resultingVersion: number; proposalIds: string[]; reverted?: boolean };

export interface StoryWorkspaceDataSource {
  readonly mode: "demo" | "production";
  loadProject(projectId: string): Promise<CanvasState>;
  saveScene(scene: CanvasScene): Promise<CanvasScene>;
  createPart(input: CreatePartInput): Promise<StoryPart>;
  createChapter(input: CreateChapterInput): Promise<StoryChapter>;
  createScene(input: CreateSceneInput): Promise<CanvasScene>;
  updateStructure(command: StructureCommand): Promise<StructureResult>;
  createEntity(input: CreateEntityInput): Promise<StoryEntity>;
  updateEntity(input: UpdateEntityInput): Promise<StoryEntity>;
  analyzeBlocks(input: StoryAnalysisInput): Promise<StoryAnalysisResult>;
  confirmProposals(input: ConfirmProposalInput): Promise<CanonCommit>;
  revertCommit(commitId: string): Promise<CanonCommit>;
}

export interface StoryAnalyzer { analyze(input: { scene: CanvasScene; paragraphId: string; text: string; entities: StoryEntity[] }): StoryObservation[] }

export type CanvasAction =
  | { type: "OPEN_SCENE"; sceneId: string } | { type: "SET_MODE"; mode: CanvasMode } | { type: "UPDATE_SCENE"; sceneId: string; content: string } | { type: "SCENE_SAVED"; sceneId: string; revision: number }
  | { type: "RENAME_SCENE"; sceneId: string; title: string } | { type: "CREATE_PART"; title?: string; position?: number }
  | { type: "CREATE_CHAPTER"; title?: string; partId?: string; position?: number } | { type: "CREATE_SCENE"; title?: string; chapterId?: string; position?: number }
  | { type: "STRUCTURE"; command: StructureCommand } | { type: "SET_PROPOSALS"; proposals: StoryObservation[] } | { type: "CONFIRM_PROPOSALS"; ids: string[] }
  | { type: "DISMISS_PROPOSAL"; id: string } | { type: "CREATE_ENTITY"; entity: StoryEntity } | { type: "UPDATE_ENTITY"; entity: StoryEntity }
  | { type: "SELECT_ENTITY"; id?: string } | { type: "SET_SYNC"; sync: Partial<GoogleWorkspaceState> } | { type: "SET_OUTLINE"; expanded: boolean }
  | { type: "SET_FOCUS"; focus: boolean } | { type: "DECIDE_FINDING"; id: string; status: ReviewFinding["status"] }
  | { type: "SET_SETTING"; key: "wordTarget" | "pulseEnabled" | "reducedMotion" | "textSize"; value: number | boolean }
  | { type: "RESTORE"; state: CanvasState } | { type: "RESET" };
