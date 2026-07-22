import type { Metadata } from "next";
import localFont from "next/font/local";
import { StoryCanvasProvider } from "@/components/story-canvas/hooks/useStoryCanvas";
import "./studio-demo.css";
import "./story-font.css";
import "./mobile-overrides.css";

export const metadata: Metadata = { title: "Story Canvas · Morrow", robots: { index: false, follow: false } };
const geist = localFont({ src: "../../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2", variable: "--font-story-ui", display: "swap" });

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <div className={geist.variable}><StoryCanvasProvider>{children}</StoryCanvasProvider></div>;
}
