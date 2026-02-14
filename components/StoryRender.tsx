export function StoryRender({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);

  return (
    <article className="prose prose-slate max-w-none">
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 8)}`} className="leading-8 text-slate-800">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
