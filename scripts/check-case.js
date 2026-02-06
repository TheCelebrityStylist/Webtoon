#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const errors = [];
const importPattern = /@\/Lib\//g;

function walk(dir, files = []) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    if (entry === ".git" || entry === "node_modules") continue;
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (entry === "Lib") {
        errors.push(`Disallowed directory found: ${full}`);
      }
      walk(full, files);
    } else if (stats.isFile()) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(process.cwd());
const matches = [];

for (const file of files) {
  if (!/\.(ts|tsx|js|jsx|mdx)$/.test(file)) continue;
  const content = readFileSync(file, "utf8");
  if (importPattern.test(content)) {
    matches.push(file);
  }
}

if (matches.length) {
  errors.push(`Invalid import casing found:\n${matches.join("\n")}`);
}

if (errors.length) {
  console.error("Case-sensitivity check failed:\n" + errors.join("\n"));
  process.exit(1);
}

console.log("Case-sensitivity check passed.");
