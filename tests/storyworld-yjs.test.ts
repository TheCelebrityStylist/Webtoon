import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { createSceneYDocument, encodeSceneSnapshot, mergeSceneUpdates, missingSceneUpdate, readManuscriptMetadata, restoreSceneDocument } from "@/lib/storyworld/local-first/y-document";

describe("local-first scene documents", () => {
  it("round-trips rich manuscript metadata through a Yjs snapshot", () => {
    const original = createSceneYDocument("scene-a", {
      json: { type: "doc", content: [{ type: "paragraph", attrs: { blockId: "block-a" }, content: [{ type: "text", marks: [{ type: "bold" }], text: "Preserved." }] }] },
      text: "Preserved.",
    });
    const restored = restoreSceneDocument("scene-a", encodeSceneSnapshot(original).snapshot);
    expect(readManuscriptMetadata(restored)).toEqual(readManuscriptMetadata(original));
  });

  it("merges offline changes made by two devices without discarding either edit", () => {
    const base = createSceneYDocument("scene-a");
    const snapshot = encodeSceneSnapshot(base).snapshot;
    const left = restoreSceneDocument("scene-a", snapshot);
    const right = restoreSceneDocument("scene-a", snapshot);
    left.getText("offline").insert(0, "left ");
    right.getText("offline").insert(0, "right ");
    const leftUpdate = missingSceneUpdate(left, Y.encodeStateVector(base));
    const rightUpdate = missingSceneUpdate(right, Y.encodeStateVector(base));
    Y.applyUpdate(base, mergeSceneUpdates([leftUpdate, rightUpdate]));
    const value = base.getText("offline").toString();
    expect(value).toContain("left");
    expect(value).toContain("right");
  });

  it("exchanges only state missing from a remote state vector", () => {
    const document = createSceneYDocument("scene-a");
    const remote = createSceneYDocument("scene-a");
    document.getText("offline").insert(0, "new edit");
    const update = missingSceneUpdate(document, Y.encodeStateVector(remote));
    Y.applyUpdate(remote, update);
    expect(remote.getText("offline").toString()).toBe("new edit");
    expect(missingSceneUpdate(document, Y.encodeStateVector(remote))).toHaveLength(2);
  });
});
