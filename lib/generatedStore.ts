import { promises as fs } from "node:fs";
import path from "node:path";
import type { Series } from "@/lib/types";

const dataPath = path.join(process.cwd(), "data", "generated.json");

type StoreState = {
  series: Series[];
};

const memoryState: StoreState = (globalThis as { __generatedStore?: StoreState })
  .__generatedStore ?? { series: [] };

if (!(globalThis as { __generatedStore?: StoreState }).__generatedStore) {
  (globalThis as { __generatedStore?: StoreState }).__generatedStore = memoryState;
}

export async function getGeneratedSeries(): Promise<Series[]> {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const parsed = JSON.parse(raw) as Series[];
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return memoryState.series;
  }
}

export async function addGeneratedSeries(series: Series) {
  try {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    const current = await getGeneratedSeries();
    const next = [series, ...current.filter((s) => s.slug !== series.slug)];
    await fs.writeFile(dataPath, JSON.stringify(next, null, 2));
    memoryState.series = next;
    return { stored: true };
  } catch {
    memoryState.series = [series, ...memoryState.series.filter((s) => s.slug !== series.slug)];
    return { stored: false };
  }
}
