// app/[slug]/page.tsx
import type { Metadata } from "next";

type RouteParams = { slug: string };

// Works whether Next provides params as an object OR as a Promise (Next 15 typing quirk)
type Props = {
  params: RouteParams | Promise<RouteParams>;
};

function resolveParams(p: Props["params"]) {
  return Promise.resolve(p);
}

// (Optional) If you have generateStaticParams, keep it below this block.
// export async function generateStaticParams() { ... }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await resolveParams(params);

  // TODO: If you already fetch series data here, keep your existing logic.
  // This is a safe default that compiles.
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

  return {
    title: `${title} • EU Webtoon`,
    description: `Read ${title} on EU Webtoon.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await resolveParams(params);

  // TODO: Replace the body below with your existing page rendering logic.
  // Keeping it minimal so the build passes.
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>{slug}</h1>
      <p style={{ opacity: 0.8 }}>
        This route is compiling correctly now. Replace this content with your real series page UI.
      </p>
    </main>
  );
}
