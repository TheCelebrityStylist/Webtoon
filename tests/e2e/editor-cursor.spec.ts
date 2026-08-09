import { expect, test } from "@playwright/test";

const caretOffset = (root: HTMLElement) => {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return -1;
  const range = selection.getRangeAt(0).cloneRange();
  range.selectNodeContents(root);
  range.setEnd(selection.anchorNode!, selection.anchorOffset);
  return range.toString().length;
};

const setCaret = (root: HTMLElement, target: number) => {
  const visit = (node: Node): Text | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (target <= node.textContent!.length) return node as Text;
      target -= node.textContent!.length;
      return null;
    }
    for (const child of node.childNodes) {
      const found = visit(child);
      if (found) return found;
    }
    return null;
  };
  const node = visit(root);
  if (!node) throw new Error("Caret target is outside the manuscript");
  const selection = window.getSelection()!;
  const range = document.createRange();
  range.setStart(node, target);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  (root as HTMLElement).focus();
};

test.beforeEach(async ({ page }) => {
  await page.goto("/studio-demo?mode=write");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("typing and autosave preserve beginning and middle cursor positions", async ({ page }) => {
  const editor = page.getByLabel("Manuscript", { exact: true });
  await expect(editor).toBeVisible();
  const length = await editor.evaluate((root) => root.textContent?.length ?? 0);
  const targets = [0, Math.max(1, Math.floor(length / 2))];
  for (const target of targets) {
    await editor.evaluate(setCaret, target);
    await page.keyboard.type("X");
    await expect.poll(() => editor.evaluate(caretOffset)).toBe(target + 1);
    await page.waitForTimeout(1200);
    await expect.poll(() => editor.evaluate(caretOffset)).toBe(target + 1);
  }
});

test("committing a title does not move the manuscript cursor to the end", async ({ page }) => {
  const editor = page.getByLabel("Manuscript", { exact: true });
  const target = 7;
  await editor.evaluate(setCaret, target);
  const title = page.getByLabel("Scene title");
  await title.fill("Cursor-safe title");
  await title.press("Enter");
  await expect(editor).toBeFocused();
  await expect.poll(() => editor.evaluate(caretOffset)).toBe(target);
  await page.waitForTimeout(1200);
  await expect.poll(() => editor.evaluate(caretOffset)).toBe(target);
});
