// scripts/check-case.js
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EXCLUDE_DIRS = new Set([".git", ".next", "node_modules", "dist", "out", "coverage"]);

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
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

function main() {
  const problems = [];

  const libLower = path.join(ROOT, "lib");
  const libUpper = path.join(ROOT, "Lib");

  if (existsDir(libLower) && existsDir(libUpper)) {
    problems.push("Both `/lib` and `/Lib` exist. Keep only `/lib` (lowercase).");
  }

  const allFiles = walk(ROOT);

  // Any file path containing a "Lib" segment
  const libSegmentFiles = allFiles.filter((f) => f.split(path.sep).includes("Lib"));
  if (libSegmentFiles.length) {
    problems.push(
      `Found files under a \`Lib/\` path:\n- ${libSegmentFiles
        .slice(0, 20)
        .map((f) => path.relative(ROOT, f))
        .join("\n- ")}${libSegmentFiles.length > 20 ? "\n- ... (more)" : ""}`
    );
  }

  // Any source files importing "@/Lib"
  const srcFiles = allFiles.filter((f) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f));
  const badImports = [];
  for (const f of srcFiles) {
    const txt = fs.readFileSync(f, "utf8");
    if (txt.includes("@/Lib/") || txt.includes('from "@/Lib') || txt.includes("from '@/Lib")) {
      badImports.push(path.relative(ROOT, f));
    }
  }
  if (badImports.length) {
    problems.push(`Found imports using "@/Lib" in:\n- ${badImports.join("\n- ")}\nReplace with "@/lib".`);
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

