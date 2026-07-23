"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    gapi?: { load: (name: string, callback: () => void) => void };
    google?: { picker: { Action: { PICKED: string; CANCEL: string }; ViewId: { DOCUMENTS: string }; DocsView: new (viewId: string) => { setMimeTypes: (value: string) => unknown }; PickerBuilder: new () => { addView: (view: unknown) => unknown; setOAuthToken: (token: string) => unknown; setDeveloperKey: (key: string) => unknown; setAppId: (id: string) => unknown; setCallback: (callback: (data: { action: string; docs?: Array<{ id: string; name: string; mimeType: string; url?: string }> }) => void) => unknown; build: () => { setVisible: (visible: boolean) => void } } } };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadPicker() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => window.gapi?.load("picker", resolve);
    script.onerror = () => reject(new Error("Google Picker could not load"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function GooglePickerBridge({ onPick, onCancel, onError }: { onPick: (file: { id: string; name: string; mimeType: string; url?: string }) => void; onCancel?: () => void; onError?: (message: string) => void }) {
  useEffect(() => {
    const open = async () => {
      const focused = document.activeElement as HTMLElement | null;
      try {
        const configResponse = await fetch("/api/integrations/google/picker-token", { cache: "no-store" });
        const config = await configResponse.json();
        if (!configResponse.ok) throw new Error(config.error ?? "Connect Google first");
        await loadPicker();
        if (!window.google?.picker || !config.developerKey) throw new Error("Google Picker is not configured");
        const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCUMENTS);
        view.setMimeTypes("application/vnd.google-apps.document");
        const builder = new window.google.picker.PickerBuilder();
        builder.addView(view);
        builder.setOAuthToken(config.accessToken);
        builder.setDeveloperKey(config.developerKey);
        if (config.appId) builder.setAppId(config.appId);
        builder.setCallback((data) => {
          if (data.action === window.google?.picker.Action.PICKED && data.docs?.[0]) {
            const file = data.docs[0];
            onPick(file);
            requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("morrow:google-picked", { detail: file })));
          }
          if (data.action === window.google?.picker.Action.CANCEL) onCancel?.();
          requestAnimationFrame(() => focused?.focus());
        });
        builder.build().setVisible(true);
      } catch (error) {
        onError?.(error instanceof Error ? error.message : "Google Picker failed");
      }
    };
    addEventListener("morrow:google-picker", open);
    return () => removeEventListener("morrow:google-picker", open);
  }, [onCancel, onError, onPick]);
  return null;
}
