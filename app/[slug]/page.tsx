// app/[slug]/page.tsx
import type { Metadata } from "next";

type RouteParams = { slug: string };

// IMPORTANT (Next 15 typing quirk):
// Next's generated PageProps expects `params` to be Promise<any> | undefined.
// So we type it as Promise<RouteParams> and always `await` it.
// Runtime still works even if params is actually a plain object.
type Props = {
  params: Promise<RouteParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());

  return {
    title: `${title} • EU Webtoon`,
    description: `Read ${title} on EU Webtoon.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>{slug}</h1>
      <p style={{ opacity: 0.8 }}>
        Build is fixed. Replace this content with your real series page UI.
      </p>
    </main>
  );
}
