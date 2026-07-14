"use client";
export function DeleteProjectForm({ action, title }: { action: () => Promise<void>; title: string }) { return <form action={action} onSubmit={(event) => { if (!window.confirm(`Delete “${title}”? This will remove it from the studio.`)) event.preventDefault(); }}><button className="danger-button" type="submit">Delete project</button></form>; }
