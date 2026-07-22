import type { CanvasScene, CanvasState, StoryEntity } from "./types";

export const storyEntities: StoryEntity[] = [
  { id: "lena", name: "Lena Ortiz", type: "person", aliases: ["Lena"], currentLocation: "Conversation Room", state: "Following the missing hours", appearances: ["museum-entrance", "west-hall", "conversation-room", "archive-door"] },
  { id: "tomas", name: "Tomas Reed", type: "person", aliases: ["Tomas"], currentLocation: "Archive Room", state: "Keeping the archive sealed", appearances: ["portrait-gallery", "conversation-room", "archive-door"] },
  { id: "rowan", name: "Rowan Hale", type: "person", aliases: ["Rowan"], currentLocation: "Rowan House", state: "Missing", appearances: ["rowan-letter", "river-bank"] },
  { id: "rowan-house", name: "Rowan House", type: "place", aliases: [], state: "Unoccupied since the clocks stopped", appearances: ["rowan-letter", "river-bank"] },
  { id: "conversation-room", name: "Conversation Room", type: "place", aliases: ["conversation room"], appearances: ["conversation-room"] },
  { id: "portrait-gallery", name: "Portrait Gallery", type: "place", aliases: ["gallery"], appearances: ["portrait-gallery", "restored-portrait"] },
  { id: "west-hall", name: "West Hall", type: "place", aliases: ["west hall"], appearances: ["west-hall"] },
  { id: "river", name: "River", type: "place", aliases: ["river"], appearances: ["river-bank"] },
  { id: "silver-key", name: "Silver Key", type: "object", aliases: ["silver key", "key"], currentHolder: "Lena Ortiz", currentLocation: "Conversation Room", state: "Cold to the touch", appearances: ["conversation-room", "river-bank", "archive-door"] },
  { id: "black-diary", name: "Black Diary", type: "object", aliases: ["black diary", "diary"], currentLocation: "Portrait Gallery", appearances: ["portrait-gallery", "missing-hour"] },
];

export const scenes: CanvasScene[] = [
  { id: "museum-entrance", chapterId: "chapter-1", title: "Before opening", content: "Lena arrived before the museum opened. The brass doors reflected a sky that had not yet brightened.", location: "Museum Entrance", people: ["lena"], objects: [], summary: "Lena arrives before opening and finds the museum awake without its staff.", order: 0 },
  { id: "west-hall", chapterId: "chapter-1", title: "The stopped clocks", content: "Every clock in the West Hall had stopped at 3:17. Lena heard one final tick from behind the altered portrait.", location: "West Hall", people: ["lena"], objects: [], summary: "The missing hours first become visible.", order: 1 },
  { id: "portrait-gallery", chapterId: "chapter-1", title: "The altered portrait", content: "Tomas waited in the Portrait Gallery beside a canvas no one remembered hanging. The Black Diary lay open beneath it.", location: "Portrait Gallery", people: ["lena", "tomas"], objects: ["black-diary"], summary: "A portrait and diary contradict the museum catalogue.", order: 2 },
  { id: "conversation-room", chapterId: "chapter-2", title: "The conversation room", content: "Lena turned the silver key over in her palm. It was colder than she remembered.\n\nShe had meant to give it to Tomas, but the archive door was waiting.", location: "Conversation Room", people: ["lena", "tomas"], objects: ["silver-key"], summary: "Lena chooses to keep the key.", order: 3 },
  { id: "rowan-letter", chapterId: "chapter-2", title: "Rowan's letter", content: "Rowan's letter named Rowan House and warned Lena never to cross the river after 3:17.", location: "Conversation Room", people: ["lena", "tomas", "rowan"], objects: [], summary: "A warning ties Rowan House to the stopped clocks.", order: 4 },
  { id: "missing-hour", chapterId: "chapter-2", title: "The missing hour", content: "The Black Diary skipped from 2:17 to 4:17. In the gap, Lena found her own handwriting.", location: "Conversation Room", people: ["lena"], objects: ["black-diary"], summary: "Lena discovers that she recorded the lost hour.", order: 5 },
  { id: "restored-portrait", chapterId: "chapter-3", title: "The restored face", content: "The restored portrait wore Lena's expression. Tomas admitted that someone had repainted it overnight.", location: "Portrait Gallery", people: ["lena", "tomas"], objects: [], summary: "The altered portrait becomes personal.", order: 6 },
  { id: "river-bank", chapterId: "chapter-3", title: "At the river", content: "Lena checked that the silver key was still in her pocket before following Rowan's footprints to the water. The current carried a silver glint toward the museum.", location: "River", people: ["lena", "rowan"], objects: ["silver-key"], summary: "The river joins Rowan's disappearance to the key.", order: 7 },
  { id: "archive-door", chapterId: "chapter-3", title: "The archive door", content: "Lena slid the silver key into the archive lock. Behind the door, every missing clock began to strike.", location: "Archive Room", people: ["lena", "tomas"], objects: ["silver-key"], summary: "Lena uses the key and the missing hours return.", order: 8 },
];

export function createCanvasState(): CanvasState {
  return {
    version: 2,
    projectTitle: "The Museum of Lost Hours",
    currentSceneId: "conversation-room",
    mode: "write",
    outlineExpanded: true,
    focusMode: false,
    scenes: structuredClone(scenes),
    entities: structuredClone(storyEntities),
    observations: [],
    dismissedObservationKeys: [],
    findings: [
      { id: "portrait-source", sceneId: "restored-portrait", quote: "someone had repainted it overnight", issue: "The portrait's restorer is still unknown.", reason: "This resolves or deepens an open question introduced in Chapter 1.", relatedQuote: "a canvas no one remembered hanging", status: "open" },
      { id: "key-future", sceneId: "archive-door", quote: "Lena slid the silver key into the archive lock.", issue: "Lena must possess the key here.", reason: "An earlier state change may leave the key at the river.", relatedQuote: "The current carried a silver glint", status: "open" },
      { id: "clock-time", sceneId: "west-hall", quote: "stopped at 3:17", issue: "The exact time is a repeated story promise.", reason: "Later clock references should preserve 3:17 unless intentionally changed.", relatedQuote: "never to cross the river after 3:17", status: "open" },
    ],
    wordTarget: 750,
    pulseEnabled: true,
    reducedMotion: false,
    textSize: 20,
  };
}
