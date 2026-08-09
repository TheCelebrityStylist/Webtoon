"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import type { JSONContent } from "@tiptap/react";
import { HttpCollaborationTransport } from "@/lib/storyworld/local-first/collaboration-transport";
import { createSceneYDocument, encodeSceneSnapshot } from "@/lib/storyworld/local-first/y-document";

export function useCollaborativeScene(input: {
  projectId: string;
  sceneId: string;
  branchId?: string;
  initialJson: JSONContent;
  initialText: string;
  enabled: boolean;
}) {
  // Initial content seeds a newly opened scene only; parent autosave updates must never replace the Y.Doc.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const document = useMemo(() => createSceneYDocument(input.sceneId, { json: input.initialJson, text: input.initialText }), [input.branchId, input.sceneId]);
  const [status, setStatus] = useState<"local" | "syncing" | "synced" | "offline" | "conflict">("local");
  const [localHydrated, setLocalHydrated] = useState(!input.enabled);
  const [snapshotSequence, setSnapshotSequence] = useState(0);
  const pending = useRef<Array<{ mutationId: string; bytes: Uint8Array }>>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transport = useMemo(() => new HttpCollaborationTransport(input.projectId), [input.projectId]);

  useEffect(() => {
    if (!input.enabled) return;
    let active = true;
    let persistence: { destroy: () => Promise<void>; once: (name: string, callback: () => void) => void } | undefined;
    void import("y-indexeddb").then(({ IndexeddbPersistence }) => {
      if (!active) return;
      persistence = new IndexeddbPersistence(`morrow:${input.projectId}:${input.branchId ?? "main"}:${input.sceneId}`, document);
      persistence.once("synced", () => { if (active) setLocalHydrated(true); });
    });
    return () => {
      active = false;
      void persistence?.destroy();
    };
  }, [document, input.branchId, input.enabled, input.projectId, input.sceneId]);

  useEffect(() => {
    if (!input.enabled) return;
    let active = true;
    const flush = async () => {
      if (!pending.current.length || !navigator.onLine) {
        if (!navigator.onLine) setStatus("offline");
        return;
      }
      const outgoing = pending.current.splice(0);
      setStatus("syncing");
      try {
        const result = await transport.sync({
          sceneId: input.sceneId,
          branchId: input.branchId,
          stateVector: Y.encodeStateVector(document),
          updates: outgoing,
        });
        Y.applyUpdate(document, result.update, "server-sync");
        if (active) { setSnapshotSequence(result.snapshotSequence); setStatus("synced"); }
      } catch {
        pending.current.unshift(...outgoing);
        if (active) setStatus(navigator.onLine ? "conflict" : "offline");
      }
    };
    const update = (bytes: Uint8Array, origin: unknown) => {
      if (origin === "server-sync" || origin === "server-snapshot") return;
      pending.current.push({ mutationId: crypto.randomUUID(), bytes });
      setStatus(navigator.onLine ? "local" : "offline");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 350);
    };
    document.on("update", update);
    const reconnect = () => void flush();
    addEventListener("online", reconnect);
    void transport.sync({ sceneId: input.sceneId, branchId: input.branchId, stateVector: Y.encodeStateVector(document), updates: [] })
      .then((result) => { Y.applyUpdate(document, result.update, "server-sync"); if (active) { setSnapshotSequence(result.snapshotSequence); setStatus("synced"); } })
      .catch(() => { if (active) setStatus(navigator.onLine ? "conflict" : "offline"); });
    return () => {
      active = false;
      document.off("update", update);
      removeEventListener("online", reconnect);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [document, input.branchId, input.enabled, input.sceneId, transport]);

  return { document, status, localHydrated, snapshotSequence, snapshot: () => encodeSceneSnapshot(document) };
}
