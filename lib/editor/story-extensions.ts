import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { EditorState, Transaction } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

export type StoryDecoration = { blockId: string; from: number; to: number; entityType: string; label: string };
export const storyDecorationKey = new PluginKey<DecorationSet>("story-decorations");

const createId = () => `block-${crypto.randomUUID()}`;

export const StableBlockIds = Extension.create({
  name: "stableBlockIds",
  addGlobalAttributes() {
    return [{
      types: ["paragraph", "heading", "blockquote", "codeBlock"],
      attributes: {
        blockId: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-block-id"),
          renderHTML: (attributes) => ({ "data-block-id": attributes.blockId }),
        },
      },
    }];
  },
  onCreate() {
    const transaction = this.editor.state.tr;
    this.editor.state.doc.descendants((node, position) => {
      if (node.isBlock && !node.attrs.blockId) transaction.setNodeMarkup(position, undefined, { ...node.attrs, blockId: createId() });
    });
    if (transaction.docChanged) this.editor.view.dispatch(transaction);
  },
  appendTransaction(_transactions: readonly Transaction[], _oldState: EditorState, newState: EditorState) {
    const transaction = newState.tr;
    let changed = false;
    newState.doc.descendants((node: ProseMirrorNode, position: number) => {
      if (node.isBlock && node.type.name !== "doc" && !node.attrs.blockId) {
        transaction.setNodeMarkup(position, undefined, { ...node.attrs, blockId: createId() });
        changed = true;
      }
    });
    return changed ? transaction : null;
  },
});

export const StoryDecorations = Extension.create({
  name: "storyDecorations",
  addProseMirrorPlugins() {
    return [new Plugin({
      key: storyDecorationKey,
      state: {
        init: () => DecorationSet.empty,
        apply(transaction, previous) {
          const supplied = transaction.getMeta(storyDecorationKey) as StoryDecoration[] | undefined;
          if (!supplied) return previous.map(transaction.mapping, transaction.doc);
          const decorations: Decoration[] = [];
          transaction.doc.descendants((node, position) => {
            const blockId = node.attrs.blockId as string | undefined;
            if (!blockId) return;
            for (const item of supplied.filter((candidate) => candidate.blockId === blockId)) {
              const from = Math.min(position + 1 + item.from, position + node.nodeSize - 1);
              const to = Math.min(position + 1 + item.to, position + node.nodeSize - 1);
              if (to > from) decorations.push(Decoration.inline(from, to, { class: `story-entity story-entity-${item.entityType.toLowerCase()}`, "data-entity-label": item.label }));
            }
          });
          return DecorationSet.create(transaction.doc, decorations);
        },
      },
      props: { decorations: (state) => storyDecorationKey.getState(state) },
    })];
  },
});
