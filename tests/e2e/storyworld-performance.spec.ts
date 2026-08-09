import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

test("flagship interactions stay inside the release performance budget", async ({
  page,
}) => {
  const start = performance.now();
  await page.goto("/studio-demo?mode=write");
  const editor = page.getByLabel("Manuscript", { exact: true });
  await expect(editor).toBeVisible();
  const writeInteractiveMs = performance.now() - start;

  const editorTransactions = await editor.evaluate((root) => {
    root.focus();
    const values: number[] = [];
    for (let index = 0; index < 20; index += 1) {
      const before = performance.now();
      document.execCommand("insertText", false, "x");
      values.push(performance.now() - before);
    }
    return values.sort((a, b) => a - b);
  });
  const editorTransactionP95Ms =
    editorTransactions[Math.floor(editorTransactions.length * 0.95) - 1];

  let before = performance.now();
  await page.getByRole("button", { name: "Story Library" }).click();
  await expect(page.getByRole("dialog", { name: "Story Library" })).toBeVisible();
  const libraryOpenMs = performance.now() - before;
  await page.getByLabel("Close Story Library").click();

  before = performance.now();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Add anything to the story" })).toBeVisible();
  const createOpenMs = performance.now() - before;
  await page.getByLabel("Close Quick Capture").click();

  before = performance.now();
  await page.getByRole("button", { name: "WORLD" }).click();
  await expect(page.locator('[data-layout-ready="true"]')).toBeVisible();
  const worldInitialLayoutMs = performance.now() - before;

  before = performance.now();
  await page.getByLabel("Previous story point").click();
  await expect(page.getByRole("slider", { name: "Story point" })).toHaveValue("8");
  const storyTimeUpdateMs = performance.now() - before;

  before = performance.now();
  await page.goto("/studio-demo?mode=branches");
  await expect(page.getByTestId("branches-workspace")).toBeVisible();
  const branchLoadMs = performance.now() - before;

  before = performance.now();
  await page.getByRole("button", { name: /Key left behind/ }).click();
  await expect(page.getByLabel("Main and branch comparison")).toBeVisible();
  const comparisonLoadMs = performance.now() - before;

  const measurements = {
    writeInteractiveMs,
    editorTransactionP95Ms,
    worldInitialLayoutMs,
    branchLoadMs,
    comparisonLoadMs,
    storyTimeUpdateMs,
    libraryOpenMs,
    createOpenMs,
  };
  fs.mkdirSync(path.resolve("artifacts/morrow-storyworld-rc"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.resolve("artifacts/morrow-storyworld-rc/performance.json"),
    `${JSON.stringify(measurements, null, 2)}\n`,
  );

  expect(writeInteractiveMs).toBeLessThan(1500);
  expect(editorTransactionP95Ms).toBeLessThan(16);
  expect(worldInitialLayoutMs).toBeLessThan(1500);
  expect(comparisonLoadMs).toBeLessThan(600);
  expect(libraryOpenMs).toBeLessThan(150);
  expect(createOpenMs).toBeLessThan(100);
});
