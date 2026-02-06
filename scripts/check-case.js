// scripts/check-case.js
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EXCLUDE_DIRS = new Set([".git", ".next", "node_modules", "dist", "out", "coverage"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function existsDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function main() {
  const libLower = path.join(ROOT, "lib");
  const libUpper = path.join(ROOT, "Lib");

  const problems = [];

  // 1) Detect both lib + Lib
  if (existsDir(libLower) && existsDir(libUpper)) {
    problems.push("Both `/lib` and `/Lib` exist. Keep only `/lib` (lowercase).");
  }

  // 2) Detect any path segments named "Lib"
  const all = walk(ROOT);
  const hasLibSegment = all.some((f) => f.split(path.sep).includes("Lib"));
  if (hasLibSegment) {
    problems.push("Found files under a `Lib/` directory path. Rename/remove `Lib` to `lib`.");
  }

  // 3) Detect any import strings using "@/Lib"
  const codeFiles = all.filter((f) =>
    /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f)
  );

  const badImports = [];
  for (const f of codeFiles) {
    const txt = readText(f);
    if (txt.includes("@/Lib/") || txt.includes('from "@/Lib') || txt.includes("from '@/Lib")) {
      badImports.push(path.relative(ROOT, f));
    }
  }
  if (badImports.length) {
    problems.push(
      `Found imports using "@/Lib" in:\n- ${badImports.join("\n- ")}\nReplace with "@/lib".`
    );
  }

  if (problems.length) {
    console.error("\nCase-sensitivity check failed:\n");
    for (const p of problems) console.error(`- ${p}`);
    console.error("\nFix these and redeploy.\n");
    process.exit(1);
  }

  console.log("Case-sensitivity check passed.");
}

main();
