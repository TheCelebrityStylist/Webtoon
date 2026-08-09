import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

test.setTimeout(90_000);

const artifacts = path.resolve("artifacts/morrow-storyworld-rc");
const sentence = "Lena entered Rowan House carrying the silver key.";

async function capture(page: Page, name: string) {
  await expect(page).toHaveScreenshot(`${name}.png`, {
    animations: "disabled",
    caret: "hide",
    fullPage: true,
    maxDiffPixelRatio: 0.015,
  });
  await page.screenshot({
    path: path.join(artifacts, `${name}.png`),
    animations: "disabled",
    caret: "hide",
    fullPage: true,
  });
}

async function openDemo(page: Page, size: { width: number; height: number }) {
  await page.setViewportSize(size);
  await page.goto("/studio-demo?mode=write");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByLabel("Manuscript", { exact: true })).toBeVisible();
}

test("desktop flagship visual states", async ({ page }) => {
  await openDemo(page, { width: 1728, height: 960 });
  await capture(page, "write-desktop");

  await page.getByLabel("Manuscript", { exact: true }).fill(sentence);
  await expect(page.getByText("4 story details found")).toBeVisible({
    timeout: 10_000,
  });
  await page.getByText("4 story details found").click();
  await capture(page, "write-story-pulse");
  await page.getByRole("button", { name: "Add to story" }).click();
  await page.getByRole("button", { name: "Story Library" }).click();
  await page
    .getByRole("dialog", { name: "Story Library" })
    .getByRole("button", { name: /^Silver Key/ })
    .click();
  await capture(page, "write-lens");
  await page.getByLabel("Close Lens").click();
  await expect(page.getByRole("dialog", { name: "Story Library" })).toHaveCount(
    0,
  );

  await page.getByRole("button", { name: "WORLD" }).click();
  await expect(page.locator('[data-layout-ready="true"]')).toBeVisible();
  await capture(page, "world-overview");
  await page.getByLabel(/object: Silver Key/).click();
  await capture(page, "world-selected-object");
  await page.getByLabel("Previous story point").click();
  await capture(page, "world-causality");
  await page
    .getByRole("combobox", { name: "Story branch" })
    .selectOption({ label: "Key left behind" });
  await capture(page, "world-branch-difference");

  await page.goto("/studio-demo?mode=branches");
  await expect(page.getByTestId("branches-workspace")).toBeVisible();
  await capture(page, "branches-main");
  await page.getByRole("button", { name: /Key left behind/ }).click();
  await capture(page, "branches-key-left-behind");
  await capture(page, "branches-comparison");
  await page.getByRole("button", { name: "Preview merge" }).click();
  await capture(page, "merge-preview");

  await page.goto("/studio-demo?mode=write");
  await page.getByRole("button", { name: "Story Library" }).click();
  await capture(page, "library");
  await page.getByLabel("Close Story Library").click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await capture(page, "global-create");
});

test("tablet visual states", async ({ page }) => {
  await openDemo(page, { width: 768, height: 1024 });
  await capture(page, "write-tablet");
  await page.getByRole("button", { name: "WORLD" }).click();
  await expect(page.locator('[data-layout-ready="true"]')).toBeVisible();
  await capture(page, "world-tablet");
});

test("mobile visual states", async ({ page }) => {
  await openDemo(page, { width: 390, height: 844 });
  await capture(page, "write-mobile");
  await page.goto("/studio-demo?mode=branches");
  await expect(page.getByTestId("branches-workspace")).toBeVisible();
  await capture(page, "branches-mobile");
  await page.goto("/studio-demo?mode=write&panel=library");
  await expect(
    page.getByRole("dialog", { name: "Story Library" }),
  ).toBeVisible();
  await capture(page, "library-mobile");
});
