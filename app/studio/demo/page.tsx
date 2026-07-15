import { requireUser } from "@/server/session";
import { isPreviewDemoUser } from "@/lib/runtime-config";
import { notFound } from "next/navigation";

export default async function PreviewStudioPage() {
  const user = await requireUser();
  if (!isPreviewDemoUser(user.id)) notFound();
  return <main className="studio-content preview-studio">
    <header><div><p className="eyebrow">SEEDED PREVIEW · NO DATA IS SAVED</p><h1>The Museum of Lost Hours</h1><p>Explore a bounded demonstration of Morrow’s manuscript and story-memory workflow.</p></div><span>Temporary session</span></header>
    <section id="manuscript" className="preview-manuscript"><nav><small>CHAPTER 8</small><b>The conservation room</b><span>Scene goal · confront the changed memory</span></nav><article><p>Lena turned the silver key over in her palm. It was colder than she remembered.</p><p>“I meant to give this to Tomas,” she said, closing her hand around the key.</p></article><aside><small>STORY MEMORY</small><strong>Possible contradiction</strong><p>The latest confirmed owner is Lena. Review the planned transfer in Chapter 5.</p></aside></section>
    <section id="story" className="preview-studio-grid"><article><small>CHARACTER STATE</small><h2>Lena Ortiz</h2><p>Goal: prove the portrait changes memory.</p><p>Knows: Tomas remembers the earlier photograph.</p></article><article id="review"><small>REVISION QUEUE</small><h2>3 decisions</h2><p>One continuity question, one pacing note, and one dialogue echo are ready to review.</p></article></section>
    <p className="preview-disclaimer">This demonstration uses seeded data. It cannot create projects, connect Google, or persist edits.</p>
  </main>;
}
