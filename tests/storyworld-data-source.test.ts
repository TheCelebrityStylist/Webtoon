import { describe, expect, it } from "vitest";
import { DemoStoryworldDataSource } from "@/lib/storyworld/data-source";

describe("DemoStoryworldDataSource", () => {
  it("produces a readable non-empty Storyworld and nine real story-time states", async () => {
    const source = new DemoStoryworldDataSource(
      `projection-${crypto.randomUUID()}`,
    );
    const world = await source.loadWorld({
      projectId: "demo",
      branchId: "main",
      sequence: 9,
    });

    expect(world.nodes.length).toBeGreaterThanOrEqual(10);
    expect(world.edges.length).toBeGreaterThanOrEqual(12);
    expect(
      world.nodes.every(
        (node) =>
          Number.isFinite(node.x) &&
          Number.isFinite(node.y) &&
          (node.x !== 0 || node.y !== 0),
      ),
    ).toBe(true);
    expect(new Set(world.nodes.map((node) => `${node.x}:${node.y}`)).size).toBe(
      world.nodes.length,
    );

    const points = await Promise.all(
      Array.from({ length: 9 }, (_, index) =>
        source.loadStoryTime({
          projectId: "demo",
          branchId: "main",
          sequence: index + 1,
        }),
      ),
    );
    expect(points.map((point) => point.sequence)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
    expect(points.every((point) => point.entityStates.length > 0)).toBe(true);
  });

  it("keeps preview and cancellation read-only and changes version once on merge", async () => {
    const projectId = `merge-${crypto.randomUUID()}`;
    const source = new DemoStoryworldDataSource(projectId);
    const created = await source.createBranch({
      projectId,
      name: "Key left behind",
      sceneId: "conversation-room",
      sceneTitle: "The conversation room",
    });
    const inherited = await source.loadBranchScene(
      created.id,
      "conversation-room",
    );
    await source.saveBranchScene({
      ...inherited,
      manuscriptText: `${inherited.manuscriptText}\nThe key was thrown into the river.`,
    });
    const before = await source.loadBranches();
    const comparison = await source.compareBranch(created.id);
    const changeIds = comparison.changes.map((change) => change.id);

    const preview = await source.previewMerge({
      projectId,
      branchId: created.id,
      changeIds,
      expectedVersion: before.version,
    });
    expect((await source.loadBranches()).version).toBe(before.version);
    await source.cancelMergePreview(preview.id);
    expect((await source.loadBranches()).version).toBe(before.version);

    const result = await source.mergeBranch({
      projectId,
      branchId: created.id,
      changeIds,
      expectedVersion: before.version,
    });
    expect(result.resultingVersion).toBe(before.version + 1);
    expect((await source.loadBranches()).version).toBe(before.version + 1);
    const undone = await source.revertMerge({
      projectId,
      mergeId: result.mergeId,
      expectedVersion: result.resultingVersion,
    });
    expect(undone.resultingVersion).toBe(before.version + 2);
    expect(
      (await source.loadBranches()).branches.find(
        (branch) => branch.id === created.id,
      )?.mergeState,
    ).toBe("unmerged");
  });

  it("persists the selected branch and copy-on-write manuscript", async () => {
    const projectId = `persistence-${crypto.randomUUID()}`;
    const first = new DemoStoryworldDataSource(projectId);
    const created = await first.createBranch({
      projectId,
      name: "River path",
      sceneId: "conversation-room",
    });
    const inherited = await first.loadBranchScene(
      created.id,
      "conversation-room",
    );
    await first.saveBranchScene({
      ...inherited,
      manuscriptText: "Branch-only prose",
    });

    const reloaded = new DemoStoryworldDataSource(projectId);
    expect((await reloaded.loadBranches()).activeBranchId).toBe(created.id);
    expect(
      (await reloaded.loadBranchScene(created.id, "conversation-room"))
        .manuscriptText,
    ).toBe("Branch-only prose");
  });
});
