"use client";
import type { StoryEntity } from "@/lib/story-canvas/types";
import { StoryLibraryV1 } from "./StoryLibraryV1";
export function StoryLibrary({ project = "Current project", entities, onClose, onOpen, onCreate }: { project?: string; entities: StoryEntity[]; onClose: () => void; onOpen: (id: string) => void; onCreate: (name: string, type: StoryEntity["type"]) => void }) { return <StoryLibraryV1 project={project} entities={entities} onClose={onClose} onOpen={onOpen} onCreate={onCreate} onImport={() => { onClose(); requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(".sync-control")?.click()); }}/>; }
