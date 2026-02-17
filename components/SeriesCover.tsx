"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Series } from "@/lib/types";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function SeriesCover({ series, priority = false }: { series: Series; priority?: boolean }) {
  const [errored, setErrored] = useState(false);
  const slug = useMemo(() => series.slug || slugify(series.title), [series.slug, series.title]);
  const src = series.coverUrl?.endsWith(".webp") ? series.coverUrl : `/covers/${slug}.webp`;

  return (
    <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-md transition-transform hover:scale-[1.02]">
      {!errored ? (
        <Image
          src={src}
          alt={series.coverAlt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 30vw"
          onError={() => setErrored(true)}
        />
      ) : (
        <Image src="/illustrations/reading-momentum.svg" alt={`${series.title} placeholder cover`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 30vw" />
      )}
    </div>
  );
}
