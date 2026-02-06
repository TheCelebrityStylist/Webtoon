// components/SeriesCard.tsx
import Link from "next/link";
import type { Series } from "@/lib/data";

export function SeriesCard({ s }: { s: Series }) {
  return (
    <article className="card cardHover" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        className="cardCover"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(17, 24, 39, 0.85), rgba(67, 56, 202, 0.85)), url(${s.coverUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      <div className="stack">
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
          <Link href={`/series/${s.slug}`} aria-label={`View ${s.title}`}>
            {s.title}
          </Link>
        </h3>
        <p style={{ margin: 0, color: "#4b5563" }}>{s.logline}</p>
        <p className="cardMeta">
          {s.genres.join(" · ")} · {s.language.toUpperCase()} · by {s.creatorName}
        </p>
        <div className="chipRow">
          {s.genres.slice(0, 3).map((g) => (
            <span key={g} className="chip">
              {g}
            </span>
          ))}
          <span className="chip">{s.language.toUpperCase()}</span>
        </div>
        <div style={{ marginTop: "8px" }}>
          <Link href={`/series/${s.slug}`} className="btn btnGhost">
            View series
          </Link>
        </div>
      </div>
    </article>
  );
}
