import { test, expect } from "@playwright/test";
test("private writing entry points resolve without reader routes", async ({
  request,
}) => {
  for (const path of ["/", "/about", "/sign-in", "/sign-up"]) {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
  }
  expect((await request.get("/discover")).status()).toBe(404);
});
test("commercial and editorial routes resolve with meaningful content", async ({
  request,
}) => {
  for (const path of [
    "/product",
    "/writing",
    "/planning",
    "/continuity",
    "/revision",
    "/languages",
    "/google",
    "/pricing",
    "/security",
    "/blog",
    "/blog/how-to-plan-a-novel",
    "/rss.xml",
  ]) {
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
    expect((await response.text()).length).toBeGreaterThan(300);
  }
});
test("format, intelligence, Google, privacy, and regional-language proof routes resolve", async ({
  request,
}) => {
  for (const path of [
    "/story-intelligence",
    "/story-graph",
    "/characters",
    "/relationships",
    "/timeline",
    "/formats",
    "/novel-writing",
    "/screenwriting",
    "/webtoon-writing",
    "/game-writing",
    "/google-docs",
    "/google-sheets",
    "/google-drive",
    "/google-calendar",
    "/privacy",
    "/languages/english",
    "/languages/dutch",
    "/languages/german",
    "/languages/spanish",
    "/languages/portuguese",
  ]) {
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
    const html = await response.text();
    expect(html).toContain('aria-label="Main navigation"');
    expect(html.length).toBeGreaterThan(1000);
  }
});
test("landing contains accessible writing interactions and conversion landmarks", async ({
  request,
}) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain('aria-label="Main navigation"');
  expect(html).toContain("Every writer knows the feeling");
  expect(html).toContain("Start writing free");
  expect(html).toContain("Your whole story");
});
test("homepage continuity moment exposes evidence and applies a decision", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "the silver key" }).click();
  await expect(
    page.getByText("Chapter 5 says Lena kept the key after Tomas left."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Revise sentence" }).click();
  await expect(
    page.getByText("meant to hand him", { exact: false }),
  ).toBeVisible();
});
test("formats transform navigator, editor language, and metadata", async ({
  page,
}) => {
  await page.goto("/formats");
  await page.getByRole("button", { name: "Screenplay", exact: true }).click();
  await expect(
    page.getByText("INT. MUSEUM — NIGHT", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Page 47 of 108", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Game narrative", exact: true })
    .click();
  await expect(
    page.getByText("Requires trust ≥ 4", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Give him the key" }),
  ).toBeVisible();
});
test("pricing chooser changes its recommendation without hiding limits", async ({
  page,
}) => {
  await page.goto("/pricing");
  await expect(page.getByText("Writer", { exact: true }).first()).toBeVisible();
  await page.getByLabel("I translate my work").check();
  await expect(
    page.getByText("Professional", { exact: true }).first(),
  ).toBeVisible();
  await page.getByText("Compare limits and capabilities").click();
  await expect(page.getByRole("cell", { name: "10", exact: true })).toBeVisible();
});
test("planning canvas reacts to scene movement, arc focus, question trace, and undo", async ({
  page,
}) => {
  await page.goto("/planning");
  await page
    .getByRole("button", { name: /The visitor arrives/ })
    .click();
  await page
    .getByRole("button", { name: "Move The visitor arrives later" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "tracks were recalculated",
  );
  await page.getByRole("button", { name: "Tomas", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Tomas arc highlighted");
  await page
    .getByRole("button", { name: "Who sent the visitor?", exact: true })
    .click();
  await expect(page.getByText("Possible resolution · S9")).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: false }).click();
  await expect(page.getByRole("status")).toContainText("undone");
});
test("Google demo previews, resolves, imports, and reverses seeded data", async ({
  page,
}) => {
  await page.goto("/google");
  await page.getByRole("button", { name: "Preview structure" }).click();
  await expect(page.getByText("Detected structure")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Merge as Mara Vale" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Confirm demo import" }).click();
  await expect(page.getByRole("status")).toContainText("Import ready");
  await page.getByRole("button", { name: "Undo demo import" }).click();
  await expect(
    page.getByRole("button", { name: "Preview structure" }),
  ).toBeVisible();
});
test("responsive navigation exposes every destination without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/planning");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Google", exact: true }).click();
  await expect(page).toHaveURL(/\/google$/);
});
test("auth and missing routes degrade deliberately", async ({ request }) => {
  expect((await request.get("/api/auth/session")).status()).toBe(200);
  const missing = await request.get("/missing-route-check");
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain("That page is not in this story");
});
