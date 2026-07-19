import { describe, expect, it } from "vitest";
import { createDraft, manuscriptDraftSchema, retryDelay } from "@/lib/persistence/manuscript";

describe("destructive writing failure policy", () => {
  it("preserves pending text through serialization and refresh", () => {
    const before = createDraft("project", "scene", 9, { type: "doc", content: [] }, "700 words remain locally");
    const after = manuscriptDraftSchema.parse(JSON.parse(JSON.stringify(before)));
    expect(after.text).toBe(before.text);
    expect(after.syncState).toBe("pending");
  });

  it("keeps mutation retries bounded during a network outage", () => {
    expect([0, 1, 2, 3, 20].map(retryDelay)).toEqual([750, 1500, 3000, 6000, 30000]);
  });

  it("rejects corrupt recovery records instead of overwriting cloud text", () => {
    expect(manuscriptDraftSchema.safeParse({ text: "orphaned" }).success).toBe(false);
  });
});
