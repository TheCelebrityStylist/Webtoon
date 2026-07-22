"use client";

import type { CanvasMode } from "@/lib/story-canvas/types";

export function StoryTopBar({ project, breadcrumb, mode, reviewCount, saveStatus, focus, onMode, onLibrary, onReview, onSearch, onSettings, onExitFocus }: {
  project: string; breadcrumb: string; mode: CanvasMode; reviewCount: number; saveStatus: string; focus: boolean;
  onMode: (mode: CanvasMode) => void; onLibrary: () => void; onReview: () => void; onSearch: () => void; onSettings: () => void; onExitFocus: () => void;
}) {
  if (focus) return <header className="canvas-focusbar"><span>{breadcrumb}</span><button onClick={onExitFocus}>Exit focus <kbd>⇧F</kbd></button></header>;
  return <header className="canvas-topbar">
    <div className="canvas-identity"><span className="morrow-mark">M</span><strong>{project}</strong><span>{breadcrumb}</span></div>
    <nav className="mode-switcher" aria-label="Story depth">{(["write", "map", "trace"] as const).map((item) => <button key={item} aria-pressed={mode === item} onClick={() => onMode(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</nav>
    <div className="canvas-actions"><button onClick={onLibrary}>Library</button><button onClick={onReview}>Review <span>{reviewCount}</span></button><button aria-label="Search and commands" onClick={onSearch}>⌕</button><span className="save-indicator" role="status">{saveStatus}</span><button className="profile-control" onClick={onSettings} aria-label="Profile and settings">E</button></div>
  </header>;
}
