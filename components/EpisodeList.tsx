// components/EpisodeList.tsx
import Link from "next/link";
import type { Series } from "@/lib/types";

export function EpisodeList({ series }: { series: Series }) {
  return (
    <ol className="episodeList">
      {series.episodes
        .slice()
        .sort((a, b) => a.ep - b.ep)
        .map((e) => (
          <li key={e.ep} className="card">
            <div className="episodeItem">
              <div className="episodeContent">
                <p style={{ margin: 0, fontWeight: 600 }}>
                  Episode {e.ep}: {e.title}
                </p>
                <p style={{ margin: 0, color: "var(--muted)" }}>{e.excerpt}</p>
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
