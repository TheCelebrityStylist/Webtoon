import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const sentence = "Lena entered Rowan House carrying the silver key.";
const changed = "Lena threw the silver key into the river before entering Rowan House.";

test.beforeEach(async ({ page }) => {
  await page.goto("/studio-demo?mode=write");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("opens directly in a focused Write canvas without rejected dashboard patterns", async ({ page }) => {
  await expect(page.getByRole("navigation", { name: "Story depth" }).getByRole("button", { name: "Write" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".manuscript")).toBeFocused();
  await expect(page.locator(".demo-sidebar,.home-grid,.editor-toolbar,.write-inspector")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Good evening|Project home/i })).toHaveCount(0);
});

test("creates a scene inline and preserves it while switching Map", async ({ page }) => {
  await page.getByRole("button", { name: "Create scene" }).click();
  await page.getByLabel("New scene title").fill("The clockmaker's stair");
  await page.getByLabel("New scene title").press("Enter");
  await expect(page.getByLabel("Scene title")).toHaveValue("The clockmaker's stair");
  await page.getByRole("button", { name: "Map" }).click();
  await expect(page.getByRole("main", { name: "Narrative map" })).toBeVisible();
  await expect(page.locator(".chapter-bands section")).toHaveCount(3);
  await expect(page.locator(".thread-lines polyline")).toHaveCount(3);
  await page.getByRole("button", { name: /The clockmaker's stair/ }).click();
  await expect(page.getByLabel("Scene title")).toHaveValue("The clockmaker's stair");
});

test("turns prose into four evidence-backed details and opens entity Lenses", async ({ page }) => {
  const editor = page.locator(".manuscript");
  await editor.fill(sentence);
  await expect(page.getByText("4 story details found")).toBeVisible({ timeout: 4000 });
  await page.getByText("4 story details found").click();
  await expect(page.locator(".pulse-groups q")).toHaveCount(4);
  await expect(page.getByRole("strong").filter({ hasText: "Lena carries the silver key" })).toBeVisible();
  await page.getByRole("button", { name: "Add to story" }).click();
  await expect(page.getByRole("button", { name: "Lena" })).toBeVisible();
  await page.getByRole("button", { name: "Lena" }).click();
  await expect(page.getByLabel("Lena Ortiz story lens")).toBeVisible();
  await page.getByLabel("Close Lens").click();
  await page.getByRole("button", { name: /silver key/i }).click();
  await expect(page.getByLabel("Silver Key story lens")).toContainText("Current holder");
});

test("Trace shows the Silver Key trail and Reality Changed links the future archive scene", async ({ page }) => {
  const editor = page.locator(".manuscript");
  await editor.fill(sentence);
  await expect(page.getByText("4 story details found")).toBeVisible({ timeout: 4000 });
  await page.getByRole("button", { name: "Confirm all" }).click();
  await editor.fill(changed);
  await expect(page.getByText(/Reality changed/i)).toBeVisible({ timeout: 4000 });
  await page.getByText(/Reality changed/).first().click();
  await expect(page.getByRole("button", { name: /The archive door Chapter 3/ })).toBeVisible();
  await expect(page.getByText(/same tracked object is used by Lena/i)).toHaveCount(2);
  await page.getByRole("button", { name: "Trace" }).click();
  await page.locator(".trace-picker").getByRole("button", { name: /Silver Key/ }).click();
  await expect(page.getByRole("heading", { name: "Silver Key" })).toBeVisible();
  await expect(page.locator(".trace-axis")).toContainText("The archive door");
});

test("Library, Review, keyboard controls, mobile layout and accessibility remain usable", async ({ page }) => {
  await page.getByRole("button", { name: /Library/ }).click();
  await expect(page.getByRole("dialog", { name: "Story Library" })).toBeVisible();
  await page.getByRole("button", { name: "＋ New person" }).click();
  await page.getByLabel("New person name").fill("Mara Voss");
  await page.getByLabel("New person name").press("Enter");
  await expect(page.getByLabel("Mara Voss story lens")).toBeVisible();
  await page.getByLabel("Close Lens").click();
  await page.getByRole("button", { name: /Review/ }).click();
  await expect(page.getByRole("dialog", { name: "Review story decisions" })).toContainText("Finding 1 of 3");
  await page.keyboard.press("d");
  await expect(page.getByRole("dialog", { name: "Review story decisions" })).toContainText("Finding 1 of 2");
  await page.keyboard.press("Escape");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".manuscript")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
