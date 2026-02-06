// app/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";
export const alt = site.shortName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "white",
          color: "#111",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
          {site.shortName}
        </div>
        <div style={{ marginTop: 24, fontSize: 28, lineHeight: 1.3 }}>
          Read European webtoons and serialized stories
        </div>
        <div style={{ marginTop: 28, fontSize: 20, opacity: 0.8 }}>
          Free episodes · Fast Pass via credits · Creator-first
        </div>
      </div>
    ),
    size,
  );
}
