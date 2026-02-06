// components/EpisodeList.tsx
import Link from "next/link";
import type { Series } from "@/lib/data";

export function EpisodeList({ series }: { series: Series }) {
  return (
    <ol className="stack" style={{ gap: "12px", padding: 0, listStyle: "none" }}>
      {series.episodes
        .slice()
        .sort((a, b) => a.ep - b.ep)
        .map((e) => (
          <li key={e.ep} className="card" style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div className="stack" style={{ gap: "6px" }}>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  Episode {e.ep}: {e.title}
                </p>
                <p style={{ margin: 0, color: "#4b5563" }}>{e.excerpt}</p>
                <div className="chipRow" style={{ marginTop: "4px" }}>
                  <span className="chip">
                    {new Date(e.publishedAt).toLocaleDateString("en-GB")}
                  </span>
                  <span className="chip">
                    {e.isFree ? "Free" : "Fast Pass"}
                  </span>
                </div>
              </div>
              <Link href={`/series/${series.slug}/read/${e.ep}`} className="btn btnGhost">
                Read
              </Link>
            </div>
          </li>
        ))}
    </ol>
  );
}
