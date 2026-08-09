"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { prosemirrorJSONToYXmlFragment } from "y-prosemirror";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StableBlockIds,
  StoryDecorations,
  storyDecorationKey,
  type StoryDecoration,
} from "@/lib/editor/story-extensions";
import { changedParagraphs } from "@/lib/story-canvas/local-analyzer";
import { normalizeManuscript } from "@/lib/story-canvas/manuscript";
import type {
  CanvasScene,
  EntityType,
  ManuscriptDocument,
  StoryEntity,
  StoryObservation,
} from "@/lib/story-canvas/types";
import { DemoStoryworldDataSource } from "@/lib/storyworld/data-source";
import { StoryIcon } from "./StoryIcon";
import { useCollaborativeScene } from "./hooks/useCollaborativeScene";
import { MANUSCRIPT_META } from "@/lib/storyworld/local-first/y-document";
type Suggestion = {
  trigger: "@" | "#" | "!" | "/";
  query: string;
  from: number;
  to: number;
};
const kindFor = (trigger: Suggestion["trigger"]): EntityType | null =>
  trigger === "@"
    ? "person"
    : trigger === "#"
      ? "place"
      : trigger === "!"
        ? "object"
        : null;

export function LivingEditor({
  projectId,
  branchId,
  production,
  scene,
  chapterTitle,
  entities,
  observations,
  pulseEnabled,
  textSize,
  onTitle,
  onChange,
  onAnalyze,
  onEntity,
  onInlineCreate,
  onFocusMode,
  onWhatIf,
}: {
  projectId: string;
  branchId?: string;
  production: boolean;
  scene: CanvasScene;
  chapterTitle: string;
  entities: StoryEntity[];
  observations: StoryObservation[];
  pulseEnabled: boolean;
  textSize: number;
  onTitle: (title: string) => void;
  onChange: (
    manuscriptJson: ManuscriptDocument,
    manuscriptText: string,
  ) => void;
  onAnalyze: (blocks: Array<{ id: string; text: string }>) => Promise<void>;
  onEntity: (id: string) => void;
  onInlineCreate: (type: EntityType, name: string) => Promise<void>;
  onFocusMode: () => void;
  onWhatIf: (selection: {
    sceneId: string;
    blockId: string;
    from: number;
    to: number;
    quote: string;
    snapshotSequence: number;
  }) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previous = useRef(scene.manuscriptText);
  const loadedScene = useRef(scene.id);
  const [draft, setDraft] = useState(scene.manuscriptText);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [selectionMenu, setSelectionMenu] = useState(false);
  const [title, setTitle] = useState(scene.title);
  const collaboration = useCollaborativeScene({
    projectId,
    sceneId: scene.id,
    branchId,
    initialJson: scene.manuscriptJson,
    initialText: scene.manuscriptText,
    enabled: production,
  });
  const demoStoryworld = useMemo(
    () => new DemoStoryworldDataSource(projectId),
    [projectId],
  );
  const extensions = useMemo(
    () =>
      production
        ? [
            StarterKit.configure({ history: false }),
            StableBlockIds,
            StoryDecorations,
            Collaboration.configure({ document: collaboration.document }),
          ]
        : [StarterKit, StableBlockIds, StoryDecorations],
    [collaboration.document, production],
  );
  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions,
      content: production
        ? undefined
        : normalizeManuscript(
            scene.manuscriptJson,
            scene.manuscriptText,
            scene.id,
          ),
      editorProps: {
        attributes: {
          class: "manuscript",
          "aria-label": "Manuscript",
          spellcheck: "true",
          "data-placeholder": "Start writing…",
        },
      },
      onCreate: ({ editor: instance }) => instance.commands.focus("end"),
      onUpdate: ({ editor: instance }) => {
        const text = instance.getText({ blockSeparator: "\n\n" });
        if (production) {
          collaboration.document.transact(() => {
            const metadata =
              collaboration.document.getMap<unknown>(MANUSCRIPT_META);
            metadata.set("manuscriptJson", instance.getJSON());
            metadata.set("manuscriptText", text);
          }, "editor-metadata");
        }
        setDraft(text);
        const manuscriptJson = instance.getJSON() as ManuscriptDocument;
        if (!production && branchId)
          void demoStoryworld
            .saveBranchScene({
              branchId,
              sceneId: scene.id,
              manuscriptJson,
              manuscriptText: text,
              inherited: false,
              updatedAt: new Date().toISOString(),
            })
            .then(() => demoStoryworld.compileBranch(branchId))
            .then((result) =>
              window.dispatchEvent(
                new CustomEvent("morrow:branch-compiled", { detail: result }),
              ),
            );
        else onChange(manuscriptJson, text);
        const { from } = instance.state.selection;
        const before = instance.state.doc.textBetween(
          Math.max(0, from - 80),
          from,
          "\n",
          "\0",
        );
        const match = /(?:^|\s)([@#!/])([^\s@#!/]{0,40})$/.exec(before);
        setSuggestion(
          match
            ? {
                trigger: match[1] as Suggestion["trigger"],
                query: match[2],
                from: from - match[1].length - match[2].length,
                to: from,
              }
            : null,
        );
      },
      onSelectionUpdate: ({ editor: instance }) =>
        setSelectionMenu(!instance.state.selection.empty),
    },
    [scene.id, production, collaboration.document],
  );
  useEffect(() => {
    if (
      !editor ||
      !production ||
      !collaboration.localHydrated ||
      (collaboration.status !== "synced" && collaboration.status !== "offline")
    )
      return;
    const fragment = collaboration.document.getXmlFragment("prosemirror");
    if (fragment.length === 0)
      prosemirrorJSONToYXmlFragment(
        editor.schema,
        normalizeManuscript(
          scene.manuscriptJson,
          scene.manuscriptText,
          scene.id,
        ),
        fragment,
      );
  }, [
    collaboration.document,
    collaboration.localHydrated,
    collaboration.status,
    editor,
    production,
    scene.id,
    scene.manuscriptJson,
    scene.manuscriptText,
  ]);
  useEffect(() => {
    if (!editor || production || !branchId) return;
    let active = true;
    void demoStoryworld
      .loadBranchScene(branchId, scene.id)
      .catch(() => ({
        branchId,
        sceneId: scene.id,
        manuscriptJson: normalizeManuscript(
          scene.manuscriptJson,
          scene.manuscriptText,
          scene.id,
        ),
        manuscriptText: scene.manuscriptText,
        inherited: true,
        updatedAt: new Date().toISOString(),
      }))
      .then((value) => {
        if (!active) return;
        editor.commands.setContent(value.manuscriptJson, false);
        setDraft(value.manuscriptText);
        previous.current = value.manuscriptText;
      });
    return () => {
      active = false;
    };
  }, [
    branchId,
    demoStoryworld,
    editor,
    production,
    scene.id,
    scene.manuscriptJson,
    scene.manuscriptText,
  ]);
  useEffect(() => {
    setTitle(scene.title);
    if (!editor || loadedScene.current === scene.id) return;
    loadedScene.current = scene.id;
    setDraft(scene.manuscriptText);
    previous.current = scene.manuscriptText;
    if (!production)
      editor.commands.setContent(
        normalizeManuscript(
          scene.manuscriptJson,
          scene.manuscriptText,
          scene.id,
        ),
        false,
      );
  }, [
    editor,
    production,
    scene.id,
    scene.manuscriptJson,
    scene.manuscriptText,
    scene.title,
  ]);
  useEffect(() => {
    if (!editor) return;
    const confirmed = observations.filter(
      (item) => item.sceneId === scene.id && item.status === "confirmed",
    );
    const decorations: StoryDecoration[] = confirmed.map((item) => ({
      blockId: item.paragraphId,
      from: item.start,
      to: item.end,
      entityType: item.kind,
      label: item.title,
    }));
    editor.view.dispatch(
      editor.state.tr.setMeta(storyDecorationKey, decorations),
    );
  }, [editor, observations, scene.id]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        onFocusMode();
      }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [onFocusMode]);
  useEffect(() => {
    if (!pulseEnabled || draft === previous.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const changed = changedParagraphs(previous.current, draft);
      previous.current = draft;
      if (changed.length)
        void onAnalyze(
          changed.map((paragraph) => ({
            id: paragraph.id,
            text: paragraph.text,
          })),
        );
    }, 900);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [draft, onAnalyze, pulseEnabled]);
  const matches = useMemo(() => {
    const type = suggestion ? kindFor(suggestion.trigger) : null;
    return type
      ? entities
          .filter(
            (entity) =>
              entity.type === type &&
              entity.name
                .toLowerCase()
                .includes(suggestion?.query.toLowerCase() ?? ""),
          )
          .slice(0, 6)
      : [];
  }, [entities, suggestion]);
  const insertEntity = useCallback(
    async (entity?: StoryEntity) => {
      if (!editor || !suggestion) return;
      const type = kindFor(suggestion.trigger);
      if (!type) return;
      const name = entity?.name ?? suggestion.query.trim();
      if (!name) return;
      editor
        .chain()
        .focus()
        .deleteRange({ from: suggestion.from, to: suggestion.to })
        .insertContent(name)
        .run();
      setSuggestion(null);
      if (entity) onEntity(entity.id);
      else await onInlineCreate(type, name);
    },
    [editor, onEntity, onInlineCreate, suggestion],
  );
  const command = async (name: string) => {
    if (!editor || !suggestion) return;
    editor
      .chain()
      .focus()
      .deleteRange({ from: suggestion.from, to: suggestion.to })
      .run();
    setSuggestion(null);
    if (name === "event") await onInlineCreate("event", "Untitled event");
    if (name === "focus") onFocusMode();
  };
  if (!editor)
    return (
      <section className="living-editor">
        <p className="canvas-loading">Opening the manuscript…</p>
      </section>
    );
  return (
    <section className="living-editor">
      <header className="scene-heading">
        <span>
          {chapterTitle} · {scene.location || "Scene"}
        </span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => onTitle(title.trim() || "Untitled scene")}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onTitle(title.trim() || "Untitled scene");
              editor.commands.focus();
            }
          }}
          aria-label="Scene title"
        />
        <small>
          {draft.trim().split(/\s+/).filter(Boolean).length} words ·{" "}
          {production ? collaboration.status : "local"}
        </small>
      </header>
      <div
        className={`paper ${editor.isEmpty ? "empty" : ""}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) editor.commands.focus();
        }}
      >
        <i className="paragraph-pulse" aria-hidden="true" />
        <EditorContent editor={editor} style={{ fontSize: textSize }} />
        {editor.isEmpty && (
          <p className="first-scene-helper">
            Type <kbd>/</kbd> for commands
            <br />
            or start with the moment that changes everything.
          </p>
        )}
      </div>
      {suggestion && (
        <div
          className="inline-suggestion"
          role="listbox"
          aria-label={
            suggestion.trigger === "/"
              ? "Writing commands"
              : `Create or choose ${kindFor(suggestion.trigger)}`
          }
        >
          <header>
            {suggestion.trigger === "/"
              ? "Commands"
              : suggestion.trigger === "@"
                ? "People"
                : suggestion.trigger === "#"
                  ? "Places"
                  : "Objects"}
          </header>
          {suggestion.trigger === "/" ? (
            <>
              {["event", "focus"]
                .filter((item) => item.includes(suggestion.query.toLowerCase()))
                .map((item) => (
                  <button
                    key={item}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      void command(item);
                    }}
                  >
                    <StoryIcon name={item === "event" ? "event" : "scene"} />
                    <span>
                      {item === "event" ? "Create event" : "Toggle focus"}
                    </span>
                  </button>
                ))}
            </>
          ) : (
            <>
              {matches.map((entity) => (
                <button
                  key={entity.id}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    void insertEntity(entity);
                  }}
                >
                  <StoryIcon
                    name={
                      entity.type === "person"
                        ? "person"
                        : entity.type === "place"
                          ? "place"
                          : "object"
                    }
                  />
                  <span>
                    {entity.name}
                    <small>
                      {entity.type} · {entity.appearances.length} appearances
                    </small>
                  </span>
                </button>
              ))}
              {suggestion.query.trim() && (
                <button
                  className="create-match"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    void insertEntity();
                  }}
                >
                  <StoryIcon name="plus" />
                  <span>
                    Create {kindFor(suggestion.trigger)} “
                    {suggestion.query.trim()}”
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      )}
      {selectionMenu && (
        <div
          className="selection-menu"
          role="toolbar"
          aria-label="Text selection actions"
        >
          <button onClick={() => editor.chain().focus().toggleBold().run()}>
            <b>B</b>
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}>
            <i>I</i>
          </button>
          <button
            onClick={() =>
              void onInlineCreate(
                "person",
                editor.state.doc.textBetween(
                  editor.state.selection.from,
                  editor.state.selection.to,
                  " ",
                ),
              )
            }
          >
            Track
          </button>
          <button
            className="what-if"
            disabled={production && collaboration.status !== "synced"}
            onClick={() => {
              const { from, to } = editor.state.selection;
              const quote = editor.state.doc.textBetween(from, to, " ");
              const blockId = String(
                editor.state.doc.resolve(from).parent.attrs.blockId ??
                  "selection",
              );
              onWhatIf({
                sceneId: scene.id,
                blockId,
                from,
                to,
                quote,
                snapshotSequence: collaboration.snapshotSequence,
              });
            }}
          >
            What if?
          </button>
        </div>
      )}
      <footer>
        <span>Shift F · Focus</span>
        <span>
          {branchId
            ? "Branch manuscript · saved separately"
            : production
              ? "Local-first manuscript"
              : "Demo manuscript"}
        </span>
      </footer>
    </section>
  );
}
