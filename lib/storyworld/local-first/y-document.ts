import * as Y from "yjs";
import type { JSONContent } from "@tiptap/react";

export const PROSEMIRROR_FRAGMENT = "prosemirror";
export const MANUSCRIPT_META = "morrow-manuscript";

export function createSceneYDocument(sceneId: string, initial?: { json: JSONContent; text: string }) {
  const document = new Y.Doc({ guid: `morrow-scene:${sceneId}` });
  const metadata = document.getMap<unknown>(MANUSCRIPT_META);
  metadata.set("sceneId", sceneId);
  if (initial) {
    metadata.set("manuscriptJson", structuredClone(initial.json));
    metadata.set("manuscriptText", initial.text);
  }
  document.getXmlFragment(PROSEMIRROR_FRAGMENT);
  return document;
}

export function encodeSceneSnapshot(document: Y.Doc) {
  return {
    snapshot: Y.encodeStateAsUpdate(document),
    stateVector: Y.encodeStateVector(document),
  };
}

export function restoreSceneDocument(sceneId: string, snapshot: Uint8Array) {
  const document = createSceneYDocument(sceneId);
  Y.applyUpdate(document, snapshot, "server-snapshot");
  return document;
}

export function missingSceneUpdate(document: Y.Doc, remoteStateVector: Uint8Array) {
  return Y.encodeStateAsUpdate(document, remoteStateVector);
}

export function mergeSceneUpdates(updates: Uint8Array[]) {
  return Y.mergeUpdates(updates);
}

export function readManuscriptMetadata(document: Y.Doc) {
  const metadata = document.getMap<unknown>(MANUSCRIPT_META);
  return {
    json: metadata.get("manuscriptJson") as JSONContent | undefined,
    text: typeof metadata.get("manuscriptText") === "string" ? metadata.get("manuscriptText") as string : "",
  };
}
