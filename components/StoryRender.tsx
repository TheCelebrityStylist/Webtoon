// components/StoryRender.tsx
import type { ReactNode } from "react";

export function StoryRender({ content }: { content: string | undefined }): ReactNode {
  if (!content) {
    return (
      <p style={{ color: "#4b5563" }}>
        Story content will appear here once episode panels are added.
      </p>
    );
  }

  const blocks = content.split(/\n\n+/).map((block) => block.trim()).filter(Boolean);

  return (
    <div className="stack" style={{ gap: "16px" }}>
      {blocks.map((block, idx) => (
        <p key={idx} style={{ margin: 0, lineHeight: 1.7, fontSize: "1rem" }}>
          {block}
        </p>
      ))}
    </div>
  );
}
