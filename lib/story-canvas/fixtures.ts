import type { CanvasScene, CanvasState, StoryChapter, StoryEntity, StoryProject } from "./types";
import { manuscriptFromText } from "./manuscript";

const now = "2026-07-23T00:00:00.000Z";
type FixtureScene = Omit<CanvasScene, "manuscriptJson" | "manuscriptText" | "position" | "status" | "wordCount" | "lastEditedAt" | "revision"> & { content: string };
const scene = (value: FixtureScene, position: number): CanvasScene => {
  const { content, ...record } = value;
  return {
    ...record,
    manuscriptJson: manuscriptFromText(content, value.id),
    manuscriptText: content,
    content,
    position,
    status: "active",
    wordCount: content.trim().split(/\s+/).filter(Boolean).length,
    lastEditedAt: now,
    revision: 0,
  };
};

export const storyEntities: StoryEntity[] = [
  { id: "lena", name: "Lena Ortiz", type: "person", aliases: ["Lena"], role: "Museum conservator", pronouns: "she/her", description: "Follows the hours the museum has forgotten.", currentLocation: "Conversation Room", state: "Following the missing hours", appearances: ["museum-entrance", "west-hall", "conversation-room", "archive-door"], sourceCount: 8, status: "active" },
  { id: "tomas", name: "Tomas Reed", type: "person", aliases: ["Tomas"], role: "Archivist", currentLocation: "Archive Room", state: "Keeping the archive sealed", appearances: ["portrait-gallery", "conversation-room", "archive-door"], sourceCount: 5, status: "active" },
  { id: "rowan", name: "Rowan Hale", type: "person", aliases: ["Rowan"], role: "Missing clockmaker", currentLocation: "Rowan House", state: "Missing", appearances: ["rowan-letter", "river-bank"], sourceCount: 4, status: "active" },
  { id: "rowan-house", name: "Rowan House", type: "place", aliases: [], atmosphere: "Dust, stopped clocks, and river fog", state: "Unoccupied since the clocks stopped", appearances: ["rowan-letter", "river-bank"], sourceCount: 3, status: "active" },
  { id: "conversation-room", name: "Conversation Room", type: "place", aliases: ["conversation room"], atmosphere: "A room built for difficult truths", appearances: ["conversation-room", "rowan-letter", "missing-hour"], sourceCount: 4, status: "active" },
  { id: "portrait-gallery", name: "Portrait Gallery", type: "place", aliases: ["gallery"], appearances: ["portrait-gallery", "restored-portrait"], sourceCount: 3, status: "active" },
  { id: "west-hall", name: "West Hall", type: "place", aliases: ["west hall"], appearances: ["west-hall"], sourceCount: 2, status: "active" },
  { id: "river", name: "River", type: "place", aliases: ["river"], atmosphere: "Black water carrying silver light", appearances: ["river-bank"], sourceCount: 2, status: "active" },
  { id: "silver-key", name: "Silver Key", type: "object", aliases: ["silver key", "key"], currentHolder: "Lena Ortiz", currentLocation: "Conversation Room", importance: "Opens the flooded archive", state: "Cold to the touch", appearances: ["conversation-room", "river-bank", "archive-door"], sourceCount: 7, status: "active" },
  { id: "black-diary", name: "Black Diary", type: "object", aliases: ["black diary", "diary"], currentLocation: "Portrait Gallery", appearances: ["portrait-gallery", "missing-hour"], sourceCount: 3, status: "active" },
];

export const scenes: CanvasScene[] = [
  scene({ id: "museum-entrance", chapterId: "chapter-1", title: "Before opening", content: "Lena arrived before the museum opened. The brass doors reflected a sky that had not yet brightened.", location: "Museum Entrance", people: ["lena"], objects: [], summary: "Lena arrives before opening and finds the museum awake without its staff.", order: 0 }, 0),
  scene({ id: "west-hall", chapterId: "chapter-1", title: "The stopped clocks", content: "Every clock in the West Hall had stopped at 3:17. Lena heard one final tick from behind the altered portrait.", location: "West Hall", people: ["lena"], objects: [], summary: "The missing hours first become visible.", order: 1 }, 1),
  scene({ id: "portrait-gallery", chapterId: "chapter-1", title: "The altered portrait", content: "Tomas waited in the Portrait Gallery beside a canvas no one remembered hanging. The Black Diary lay open beneath it.", location: "Portrait Gallery", people: ["lena", "tomas"], objects: ["black-diary"], summary: "A portrait and diary contradict the museum catalogue.", order: 2 }, 2),
  scene({ id: "conversation-room", chapterId: "chapter-2", title: "The conversation room", content: "Lena turned the silver key over in her palm. It was colder than she remembered.\n\nShe had meant to give it to Tomas, but the archive door was waiting.", location: "Conversation Room", people: ["lena", "tomas"], objects: ["silver-key"], summary: "Lena chooses to keep the key.", order: 3 }, 0),
  scene({ id: "rowan-letter", chapterId: "chapter-2", title: "Rowan's letter", content: "Rowan's letter named Rowan House and warned Lena never to cross the river after 3:17.", location: "Conversation Room", people: ["lena", "tomas", "rowan"], objects: [], summary: "A warning ties Rowan House to the stopped clocks.", order: 4 }, 1),
  scene({ id: "missing-hour", chapterId: "chapter-2", title: "The missing hour", content: "The Black Diary skipped from 2:17 to 4:17. In the gap, Lena found her own handwriting.", location: "Conversation Room", people: ["lena"], objects: ["black-diary"], summary: "Lena discovers that she recorded the lost hour.", order: 5 }, 2),
  scene({ id: "restored-portrait", chapterId: "chapter-3", title: "The restored face", content: "The restored portrait wore Lena's expression. Tomas admitted that someone had repainted it overnight.", location: "Portrait Gallery", people: ["lena", "tomas"], objects: [], summary: "The altered portrait becomes personal.", order: 6 }, 0),
  scene({ id: "river-bank", chapterId: "chapter-3", title: "At the river", content: "Lena checked that the silver key was still in her pocket before following Rowan's footprints to the water. The current carried a silver glint toward the museum.", location: "River", people: ["lena", "rowan"], objects: ["silver-key"], summary: "The river joins Rowan's disappearance to the key.", order: 7 }, 1),
  scene({ id: "archive-door", chapterId: "chapter-3", title: "The archive door", content: "Lena slid the silver key into the archive lock. Behind the door, every missing clock began to strike.", location: "Archive Room", people: ["lena", "tomas"], objects: ["silver-key"], summary: "Lena uses the key and the missing hours return.", order: 8 }, 2),
];

export const chapters: StoryChapter[] = [
  { id: "chapter-1", projectId: "museum-of-lost-hours", title: "The altered portrait", position: 0, summary: "The museum reveals its first impossible hour.", status: "active", sceneIds: ["museum-entrance", "west-hall", "portrait-gallery"], createdAt: now, updatedAt: now },
  { id: "chapter-2", projectId: "museum-of-lost-hours", title: "The missing hours", position: 1, summary: "Lena follows the key and Rowan's warning.", status: "active", sceneIds: ["conversation-room", "rowan-letter", "missing-hour"], createdAt: now, updatedAt: now },
  { id: "chapter-3", projectId: "museum-of-lost-hours", title: "The silver key", position: 2, summary: "The key's journey reaches the archive.", status: "active", sceneIds: ["restored-portrait", "river-bank", "archive-door"], createdAt: now, updatedAt: now },
];

export const demoProject: StoryProject = { id: "museum-of-lost-hours", title: "The Museum of Lost Hours", type: "NOVEL", premise: "A conservator discovers that her museum has misplaced entire hours.", language: "en", parts: [], chapters, scenes, createdAt: now, updatedAt: now };

export function createCanvasState(): CanvasState {
  const project = structuredClone(demoProject);
  return { version: 3, project, projectTitle: project.title, currentSceneId: "conversation-room", mode: "write", outlineExpanded: true, focusMode: false, scenes: project.scenes, entities: structuredClone(storyEntities), observations: [], dismissedObservationKeys: [], selectedEntityId: "silver-key", findings: [
    { id: "portrait-source", sceneId: "restored-portrait", quote: "someone had repainted it overnight", issue: "The portrait's restorer is still unknown.", reason: "This resolves or deepens an open question introduced in Chapter 1.", relatedQuote: "a canvas no one remembered hanging", status: "open" },
    { id: "key-future", sceneId: "archive-door", quote: "Lena slid the silver key into the archive lock.", issue: "Lena must possess the key here.", reason: "An earlier state change may leave the key at the river.", relatedQuote: "The current carried a silver glint", status: "open" },
    { id: "clock-time", sceneId: "west-hall", quote: "stopped at 3:17", issue: "The exact time is a repeated story promise.", reason: "Later clock references should preserve 3:17 unless intentionally changed.", relatedQuote: "never to cross the river after 3:17", status: "open" },
  ], wordTarget: 750, pulseEnabled: true, reducedMotion: false, textSize: 20, sync: { status: "not-connected", grantedServices: [] }, dataMode: "demo" };
}
