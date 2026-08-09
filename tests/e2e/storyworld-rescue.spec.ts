import { expect, test } from "@playwright/test";
test("World layout has separated nodes, edges, and viewport-safe fit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1728, height: 960 });
  await page.goto("/studio-demo");
  await page.getByRole("button", { name: "WORLD" }).click();
  await expect(page.locator('[data-layout-ready="true"]')).toBeVisible();
  const nodes = page.locator(".react-flow__node");
  await expect(nodes).toHaveCount(await nodes.count());
  expect(await nodes.count()).toBeGreaterThanOrEqual(8);
  await nodes.first().waitFor({ state: "visible" });
  const boxes = await nodes.evaluateAll((items) =>
    items
      .map((item) => {
        const b = item.getBoundingClientRect();
        return { left: b.left, right: b.right, top: b.top, bottom: b.bottom };
      })
      .filter((b) => b.right > b.left && b.bottom > b.top),
  );
  expect(
    new Set(boxes.map((b) => `${Math.round(b.left)}:${Math.round(b.top)}`))
      .size,
  ).toBeGreaterThanOrEqual(8);
  for (let a = 0; a < boxes.length; a++)
    for (let b = a + 1; b < boxes.length; b++) {
      const x =
        Math.min(boxes[a].right, boxes[b].right) -
        Math.max(boxes[a].left, boxes[b].left);
      const y =
        Math.min(boxes[a].bottom, boxes[b].bottom) -
        Math.max(boxes[a].top, boxes[b].top);
      expect(x > 8 && y > 8).toBe(false);
    }
  expect(await page.locator(".react-flow__edge path").count()).toBeGreaterThan(
    0,
  );
  await page.getByRole("button", { name: "Fit view" }).click();
  const viewport = page.viewportSize()!;
  for (const box of await nodes.evaluateAll((items) =>
    items.slice(0, 8).map((item) => {
      const b = item.getBoundingClientRect();
      return { left: b.left, right: b.right, top: b.top, bottom: b.bottom };
    }),
  )) {
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.top).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(viewport.width);
    expect(box.bottom).toBeLessThanOrEqual(viewport.height);
  }
});
test("Demo branches previews safely, merges explicitly, undoes, and persists", async ({
  page,
}) => {
  await page.goto("/studio-demo?mode=branches");
  await expect(page.getByTestId("branches-workspace")).toBeVisible();
  await page.getByRole("button", { name: /Key left behind/ }).click();
  await expect(page.getByLabel("Main and branch comparison")).toContainText(
    "Silver Key location changed",
  );
  await page.getByRole("button", { name: "Preview merge" }).click();
  const preview = page.getByRole("dialog", { name: "Merge preview" });
  await expect(preview).toContainText("has not changed Main");
  await preview.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(preview).toHaveCount(0);
  await page.getByRole("button", { name: "Preview merge" }).click();
  await page.getByRole("button", { name: "Merge selected" }).click();
  await expect(page.getByText(/merged/)).toBeVisible();
  await page.getByRole("button", { name: "Undo merge" }).click();
  await expect(page.getByText(/Merge undone/)).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Key left behind/ }),
  ).toBeVisible();
});
test("legacy branch history migrates once to versioned IndexedDB without losing selection or undo", async ({
  page,
}) => {
  const key = "morrow:storyworld:museum-of-lost-hours:v1";
  await page.addInitScript(
    ({ storageKey }) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          version: 7,
          activeBranchId: "legacy-branch",
          branches: [
            {
              id: "main",
              name: "Main",
              status: "ACTIVE",
              active: false,
              changedScenes: 0,
              openConsequences: 0,
              mergeState: "unmerged",
            },
            {
              id: "legacy-branch",
              name: "Preserved legacy path",
              parentId: "main",
              status: "ACTIVE",
              active: true,
              changedScenes: 1,
              openConsequences: 2,
              mergeState: "unmerged",
            },
          ],
          comparisons: {},
          merges: [
            { id: "legacy-merge", branchId: "legacy-branch", changeIds: [] },
          ],
          undoState: {
            mergeId: "legacy-merge",
            branchId: "legacy-branch",
            version: 7,
          },
        }),
      );
    },
    { storageKey: key },
  );
  await page.goto("/studio-demo?mode=branches");
  await expect(
    page.getByRole("button", { name: /Preserved legacy path/ }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate((storageKey) => localStorage.getItem(storageKey), key),
    )
    .toBeNull();
  const migrated = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("morrow-storyworld", 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      const request = database
        .transaction("projects", "readonly")
        .objectStore("projects")
        .get("museum-of-lost-hours");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
  expect(migrated).toMatchObject({
    schemaVersion: 2,
    activeBranchId: "legacy-branch",
    merges: [{ id: "legacy-merge" }],
    undoState: { mergeId: "legacy-merge" },
  });
});
test("authoring surfaces have no robots or horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/studio-demo");
  await expect(
    page.locator(
      '[class*="robot"],[class*="mascot"],[class*="assistant"][style*="fixed"]',
    ),
  ).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    1440,
  );
  await page.getByRole("button", { name: /Story Library/ }).click();
  await expect(
    page.getByRole("dialog", { name: "Story Library" }),
  ).toBeVisible();
});
