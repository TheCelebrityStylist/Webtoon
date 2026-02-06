#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const errors = [];

function walk(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    if (entry === ".git" || entry === "node_modules") continue;
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (entry === "Lib") {
        errors.push(`Disallowed directory found: ${full}`);
      }
      walk(full);
    }
  }
}

try {
  walk(process.cwd());

  const files = execSync("rg -n --glob '!node_modules/**' '@/Lib/'", {
    encoding: "utf8",
  }).trim();

  if (files) {
    errors.push(`Invalid import casing found:\n${files}`);
  }
} catch (error) {
  // rg exits 1 when no matches; ignore that.
  if (error?.status && error.status !== 1) {
    errors.push("Failed to scan imports for casing issues.");
  }
}

if (errors.length) {
  console.error("Case-sensitivity check failed:\n" + errors.join("\n"));
  process.exit(1);
}

console.log("Case-sensitivity check passed.");
