import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSeriesBySlug } from "@/lib/data";

type RouteParams = { slug: string };
type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) return { title: "Series not found" };

  return {
    title: `${series.title} — EU Webtoon`,
    description: series.tagline ?? series.synopsis,
    openGraph: {
      title: `${series.title} — EU Webtoon`,
      description: series.tagline ?? series.synopsis,
      type: "website",
    },
  };
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;

  const series = getSeriesBySlug(slug);
  if (!series) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr] md:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {series.title}
            </h1>
            <p className="mt-3 text-lg text-slate-600">{series.tagline}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {series.language}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                by {series.author}
              </span>
              {series.tags?.map((t) => (
                <span key={t} className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                  {t}
                </span>
              ))}
            </div>

            <p className="mt-5 text-slate-700">{series.synopsis}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/series/${series.slug}/read/${series.episodes?.[0]?.ep ?? 1}`}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Start reading
              </Link>
              <Link
                href="/series"
                className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
              >
                Back to Series
              </Link>
            </div>
          </div>

          <div
            className="aspect-[16/10] w-full rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${series.cover?.bgFrom ?? "#6b7280"}, ${
                series.cover?.bgTo ?? "#4f46e5"
              })`,
            }}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Episodes</h2>

        <div className="mt-4 space-y-4">
          {series.episodes.map((e) => {
            const isFree = e.kind === "free";
            return (
              <div key={e.ep} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm text-slate-500">
                      Episode {e.ep} • {e.date}
                    </div>
                    <div className="mt-1 text-lg font-semibold">{e.title}</div>

                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isFree
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {isFree ? "Free" : "Fast Pass"}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/series/${series.slug}/read/${e.ep}`}
                    className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
                  >
                    Read
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
