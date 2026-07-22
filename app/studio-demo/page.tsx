import { Suspense } from "react";
import { StoryCanvas } from "@/components/story-canvas/StoryCanvas";

export default function Page() {
  return <Suspense fallback={<div className="canvas-loading">Opening the latest scene…</div>}><StoryCanvas/></Suspense>;
}
