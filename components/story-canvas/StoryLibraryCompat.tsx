"use client";
import type { StoryEntity } from "@/lib/story-canvas/types";
import { StoryLibraryV1 } from "./StoryLibraryV1";
export function StoryLibrary({ entities, onClose, onOpen, onCreate }: { entities: StoryEntity[]; onClose: () => void; onOpen: (id: string) => void; onCreate: (name: string, type: StoryEntity["type"]) => void }) { return <StoryLibraryV1 project="The Museum of Lost Hours" entities={entities} onClose={onClose} onOpen={onOpen} onCreate={onCreate} onImport={() => { onClose(); requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(".sync-control")?.click()); }}/>; }
