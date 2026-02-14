// app/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSeriesBySlug } from "@/lib/data";

type RouteParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const series = getSeriesBySlug(params.slug);

  if (!series) {
    return {
      title: "Not found",
      robots: { index: false, follow: false },
    };
  }

  const title = series.title ?? series.name ?? params.slug;
  const description =
    series.description ??
    series.blurb ??
    "Read European webtoons and serialized stories.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: series.cover ? [{ url: series.cover }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: series.cover ? [series.cover] : undefined,
    },
  };
}

export default async function Page({ params }: { params: RouteParams }) {
  const series = getSeriesBySlug(params.slug);
  if (!series) notFound();

  // Keep rendering minimal + robust against partial data
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">{series.title ?? series.name}</h1>

        {(series.description || series.blurb) && (
          <p className="mt-3 text-slate-600">
            {series.description ?? series.blurb}
          </p>
        )}

        {Array.isArray(series.tags) && series.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {series.tags.map((t: string) => (
              <span
                key={t}
                className="rounded-full border bg-slate-50 px-3 py-1 text-sm text-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

