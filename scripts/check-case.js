// scripts/check-case.js
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx"]);

function walk(dir, out = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    if (it.name === "node_modules" || it.name === ".next" || it.name === ".git") continue;
    const p = path.join(dir, it.name);
    if (it.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, "utf8"); } catch { return ""; }
}

function existsExact(p) {
  // Checks exact casing by walking the filesystem segment-by-segment
  const parts = p.split(path.sep).filter(Boolean);
  let cur = path.isAbsolute(p) ? path.parse(p).root : "";
  for (const part of parts) {
    const dir = cur || ".";
    const list = fs.readdirSync(dir);
    const hit = list.find((x) => x === part);
    if (!hit) return false;
    cur = path.join(dir, hit);
  }
  return true;
}

const files = walk(ROOT).filter((f) => EXTS.has(path.extname(f)));

let ok = true;
for (const f of files) {
  const src = readFileSafe(f);
  const re = /from\s+["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = re.exec(src))) {
    const spec = m[1] || m[2];
    if (!spec) continue;
    if (spec.startsWith("@/") || spec.startsWith("./") || spec.startsWith("../")) {
      // Only validate relative-ish imports. We don't resolve TS paths fully here.
      if (spec.startsWith("@/")) continue;

      const base = path.dirname(f);
      const raw = path.resolve(base, spec);
      const candidates = [
        raw,
        raw + ".ts",
        raw + ".tsx",
        raw + ".js",
        raw + ".jsx",
        path.join(raw, "index.ts"),
        path.join(raw, "index.tsx"),
        path.join(raw, "index.js"),
        path.join(raw, "index.jsx"),
      ];

      const found = candidates.find((c) => fs.existsSync(c));
      if (found && !existsExact(found)) {
        console.error(`Case mismatch import in: ${f}`);
        console.error(`  -> ${spec}`);
        console.error(`  -> resolves to: ${found} (but casing differs on disk)`);
        ok = false;
      }
    }
  }
}

if (!ok) {
  process.exit(1);
}

console.log("Case-sensitivity import check: OK");

