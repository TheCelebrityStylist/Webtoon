export type CanvasMode = "write" | "map" | "trace";
export type EntityType = "person" | "place" | "object" | "event";

export type CanvasScene = {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  location: string;
  people: string[];
  objects: string[];
  summary: string;
  order: number;
};

export type StoryEntity = {
  id: string;
  name: string;
  type: EntityType;
  aliases: string[];
  currentLocation?: string;
  currentHolder?: string;
  state?: string;
  appearances: string[];
};

export type StoryObservation = {
  id: string;
  subjectId: string;
  predicate: "exists" | "location" | "holder" | "entered";
  value: string;
  sceneId: string;
  paragraphId: string;
  quote: string;
  start: number;
  end: number;
  status: "proposed" | "confirmed" | "dismissed" | "changed";
  kind: EntityType | "state";
  title: string;
};

export type ReviewFinding = {
  id: string;
  sceneId: string;
  quote: string;
  issue: string;
  reason: string;
  relatedQuote: string;
  status: "open" | "accepted" | "intentional" | "dismissed";
};

export type CanvasState = {
  version: 2;
  projectTitle: string;
  currentSceneId: string;
  mode: CanvasMode;
  outlineExpanded: boolean;
  focusMode: boolean;
  scenes: CanvasScene[];
  entities: StoryEntity[];
  observations: StoryObservation[];
  dismissedObservationKeys: string[];
  findings: ReviewFinding[];
  wordTarget: number;
  pulseEnabled: boolean;
  reducedMotion: boolean;
  textSize: number;
};

export interface StoryAnalyzer {
  analyze(input: { scene: CanvasScene; paragraphId: string; text: string; entities: StoryEntity[] }): StoryObservation[];
}

export type CanvasAction =
  | { type: "OPEN_SCENE"; sceneId: string }
  | { type: "SET_MODE"; mode: CanvasMode }
  | { type: "UPDATE_SCENE"; sceneId: string; content: string }
  | { type: "RENAME_SCENE"; sceneId: string; title: string }
  | { type: "CREATE_SCENE"; title: string }
  | { type: "SET_PROPOSALS"; proposals: StoryObservation[] }
  | { type: "CONFIRM_PROPOSALS"; ids: string[] }
  | { type: "DISMISS_PROPOSAL"; id: string }
  | { type: "CREATE_ENTITY"; entity: StoryEntity }
  | { type: "SET_OUTLINE"; expanded: boolean }
  | { type: "SET_FOCUS"; focus: boolean }
  | { type: "DECIDE_FINDING"; id: string; status: ReviewFinding["status"] }
  | { type: "SET_SETTING"; key: "wordTarget" | "pulseEnabled" | "reducedMotion" | "textSize"; value: number | boolean }
  | { type: "RESTORE"; state: CanvasState }
  | { type: "RESET" };
