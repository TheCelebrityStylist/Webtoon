import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const sentence = "Lena entered Rowan House carrying the silver key.";
const changed =
  "Lena threw the silver key into the river before entering Rowan House.";

test.beforeEach(async ({ page }) => {
  await page.goto("/studio-demo?mode=write");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("opens directly in a focused Write canvas without rejected dashboard patterns", async ({
  page,
}) => {
  await expect(
    page
      .getByRole("navigation", { name: "Story workspace" })
      .getByRole("button", { name: "WRITE" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".manuscript")).toBeFocused();
  await expect(
    page.locator(".demo-sidebar,.home-grid,.editor-toolbar,.write-inspector"),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /Good evening|Project home/i }),
  ).toHaveCount(0);
});

test("creates a scene through Quick Capture and preserves it while switching World", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page
    .getByLabel("Story material")
    .fill("New scene: The clockmaker's stair");
  await page.getByRole("button", { name: "Confirm scene" }).click();
  await expect(page.getByLabel("Scene title")).toHaveValue(
    "The clockmaker's stair",
  );
  await page.getByRole("button", { name: "WORLD" }).click();
  await expect(page.getByLabel("Storyworld projection")).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(22);
  await page.getByRole("button", { name: "WRITE" }).click();
  await expect(page.getByLabel("Scene title")).toHaveValue(
    "The clockmaker's stair",
  );
});

test("turns prose into four evidence-backed details and opens entity Lenses", async ({
  page,
}) => {
  const editor = page.locator(".manuscript");
  await editor.fill(sentence);
  await expect(page.getByText("4 story details found")).toBeVisible({
    timeout: 4000,
  });
  await page.getByText("4 story details found").click();
  await expect(page.locator(".pulse-groups q")).toHaveCount(4);
  await expect(
    page.getByRole("strong").filter({ hasText: "Lena carries the silver key" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add to story" }).click();
  await page.getByRole("button", { name: "Story Library" }).click();
  await page.getByRole("dialog", { name: "Story Library" }).getByRole("button", { name: /^Lena Ortiz/ }).click();
  await expect(page.getByLabel("Lena Ortiz story lens")).toBeVisible();
  await page.getByLabel("Close Lens").click();
  await page.getByRole("button", { name: "Story Library" }).click();
  await page.getByRole("dialog", { name: "Story Library" }).getByRole("button", { name: /^Silver Key/ }).click();
  await expect(page.getByLabel("Silver Key story lens")).toContainText(
    "Current holder",
  );
});

test("World and projected Lens show the Silver Key story state", async ({
  page,
}) => {
  const editor = page.locator(".manuscript");
  await editor.fill(sentence);
  await expect(page.getByText("4 story details found")).toBeVisible({
    timeout: 4000,
  });
  await page.getByRole("button", { name: "Confirm all" }).click();
  await page.getByRole("button", { name: "WORLD" }).click();
  await page.getByLabel(/object: Silver Key/).click();
  await expect(page.getByLabel("Silver Key story lens")).toContainText(
    "At this story point",
  );
  await expect(page.getByLabel("Silver Key story lens")).toContainText(
    "Lena Ortiz",
  );
});

test("Library, Review, keyboard controls, mobile layout and accessibility remain usable", async ({
  page,
}) => {
  await page.getByRole("button", { name: /Library/ }).click();
  await expect(
    page.getByRole("dialog", { name: "Story Library" }),
  ).toBeVisible();
  await page
    .getByRole("dialog", { name: "Story Library" })
    .getByRole("button", { name: "Create" })
    .click();
  await page.getByLabel("Name").fill("Mara Voss");
  await page.getByRole("button", { name: "Create and open Lens" }).click();
  await expect(page.getByLabel("Mara Voss story lens")).toBeVisible();
  await page.getByLabel("Close Lens").click();
  await page.getByRole("button", { name: /Review/ }).click();
  await expect(
    page.getByRole("dialog", { name: "Review story decisions" }),
  ).toContainText("Finding 1 of 3");
  await page.keyboard.press("d");
  await expect(
    page.getByRole("dialog", { name: "Review story decisions" }),
  ).toContainText("Finding 1 of 2");
  await page.keyboard.press("Escape");
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".manuscript")).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
