import { Fragment, Slice, type ResolvedPos, type Node as ProsemirrorNode } from 'prosemirror-model';
import { Plugin, PluginKey, Selection, SelectionRange, TextSelection, type EditorState } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

import type { EditorView } from 'prosemirror-view';

/**
 * Custom Selection class that selects entire block nodes
 */
export class NodeRangeSelection extends Selection {
  readonly $anchorNode: ResolvedPos;
  readonly $headNode: ResolvedPos;

  constructor($anchorNode: ResolvedPos, $headNode: ResolvedPos = $anchorNode) {
    const from = Math.min($anchorNode.pos, $headNode.pos);
    const to = Math.max(
      $anchorNode.pos + ($anchorNode.nodeAfter?.nodeSize || 1),
      $headNode.pos + ($headNode.nodeAfter?.nodeSize || 1)
    );

    const ranges: SelectionRange[] = [];
    let pos = from;

    while (pos < to) {
      const $pos = $anchorNode.doc.resolve(pos);
      const node = $pos.nodeAfter;

      if (node && node.isBlock) {
        const nodeStart = pos;
        const nodeEnd = pos + node.nodeSize;
        ranges.push(new SelectionRange($anchorNode.doc.resolve(nodeStart), $anchorNode.doc.resolve(nodeEnd)));
        pos = nodeEnd;
      } else {
        pos++;
      }
    }

    const anchor = ranges.length > 0 ? ranges[0].$from : $anchorNode.doc.resolve(from);
    const head = ranges.length > 0 ? ranges[ranges.length - 1].$to : $anchorNode.doc.resolve(to);

    super(anchor, head, ranges);
    this.$anchorNode = $anchorNode;
    this.$headNode = $headNode;
  }

  override map(doc: ProsemirrorNode, mapping: { map: (pos: number) => number }): Selection {
    const anchorPos = mapping.map(this.$anchorNode.pos);
    const headPos = mapping.map(this.$headNode.pos);
    try {
      const $anchor = doc.resolve(anchorPos);
      const $head = doc.resolve(headPos);
      return new NodeRangeSelection($anchor, $head);
    } catch {
      return TextSelection.near(doc.resolve(Math.min(anchorPos, doc.content.size - 1)), 1);
    }
  }

  override eq(other: Selection): boolean {
    return (
      other instanceof NodeRangeSelection &&
      other.$anchorNode.pos === this.$anchorNode.pos &&
      other.$headNode.pos === this.$headNode.pos
    );
  }

  override toJSON(): { type: string; anchor: number; head: number } {
    return { type: 'node-range', anchor: this.$anchorNode.pos, head: this.$headNode.pos };
  }

  static override fromJSON(doc: ProsemirrorNode, json: { anchor: number; head: number }): Selection {
    try {
      return new NodeRangeSelection(doc.resolve(json.anchor), doc.resolve(json.head));
    } catch {
      return TextSelection.near(doc.resolve(Math.min(json.anchor, doc.content.size - 1)), 1);
    }
  }

  static create(doc: ProsemirrorNode, from: number, to?: number): NodeRangeSelection {
    return new NodeRangeSelection(doc.resolve(from), to !== undefined ? doc.resolve(to) : doc.resolve(from));
  }

  override getBookmark() {
    return new NodeRangeBookmark(this.$anchorNode.pos, this.$headNode.pos);
  }

  override content() {
    if (this.ranges.length === 0) return this.$anchor.doc.slice(this.from, this.to);
    const fragments: ProsemirrorNode[] = [];
    this.ranges.forEach(range => {
      const blockSlice = this.$anchor.doc.slice(range.$from.pos, range.$to.pos);
      for (let i = 0; i < blockSlice.content.childCount; i++) {
        fragments.push(blockSlice.content.child(i));
      }
    });
    return fragments.length > 0
      ? new Slice(Fragment.fromArray(fragments), 0, 0)
      : this.$anchor.doc.slice(this.from, this.to);
  }
}

// Ensure the selection isn't rendered as a native cursor
NodeRangeSelection.prototype.visible = false;
Selection.jsonID('node-range', NodeRangeSelection);

class NodeRangeBookmark {
  constructor(
    readonly anchor: number,
    readonly head: number
  ) {}
  map(mapping: { map: (pos: number) => number }) {
    return new NodeRangeBookmark(mapping.map(this.anchor), mapping.map(this.head));
  }
  resolve(doc: ProsemirrorNode) {
    try {
      return new NodeRangeSelection(doc.resolve(this.anchor), doc.resolve(this.head));
    } catch {
      return Selection.near(doc.resolve(Math.min(this.head, doc.content.size - 1)), 1);
    }
  }
}

function findBlockAt(doc: ProsemirrorNode, pos: number): { pos: number; node: ProsemirrorNode } | null {
  const $pos = doc.resolve(pos);
  const after = $pos.nodeAfter;
  if (after && after.isBlock) return { pos: $pos.pos, node: after };
  for (let i = $pos.depth; i >= 0; i--) {
    const node = $pos.node(i);
    if (node && node.isBlock && node !== doc) return { pos: $pos.before(i), node };
  }
  return null;
}

/**
 * The core ProseMirror Plugin
 */
export const blockSelectPlugin = new Plugin({
  key: new PluginKey('block-select'),

  state: {
    init: () => ({ dragging: false, startPos: null as number | null }),
    apply(tr, value) {
      const meta = tr.getMeta('block-select-drag');
      return meta !== undefined ? meta : value;
    }
  },

  props: {
    handleKeyDown(view, event) {
      const { selection, doc } = view.state;

      if (event.key === 'Escape' || (event.key === 'Enter' && selection instanceof NodeRangeSelection)) {
        if (selection instanceof NodeRangeSelection || !selection.empty) {
          view.dispatch(view.state.tr.setSelection(TextSelection.near(selection.$head, -1)));
          event.preventDefault();
          return true;
        }
      }

      if (
        !(selection instanceof NodeRangeSelection) &&
        event.shiftKey &&
        ['ArrowUp', 'ArrowDown'].includes(event.key)
      ) {
        const currentBlock = findBlockAt(doc, selection.anchor);
        if (currentBlock) {
          const targetPos =
            event.key === 'ArrowDown'
              ? currentBlock.pos + currentBlock.node.nodeSize
              : Math.max(0, currentBlock.pos - 1);
          const targetBlock = findBlockAt(doc, targetPos);
          if (targetBlock && targetBlock.pos !== currentBlock.pos) {
            view.dispatch(
              view.state.tr.setSelection(NodeRangeSelection.create(doc, currentBlock.pos, targetBlock.pos))
            );
            event.preventDefault();
            return true;
          }
        }
      }

      if (
        selection instanceof NodeRangeSelection &&
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
      ) {
        const currentBlock = findBlockAt(doc, selection.$headNode.pos);
        if (currentBlock) {
          const newPos =
            event.key === 'ArrowDown' || event.key === 'ArrowRight'
              ? currentBlock.pos + currentBlock.node.nodeSize
              : Math.max(0, currentBlock.pos - 1);

          const nextBlock = findBlockAt(doc, newPos);
          if (nextBlock) {
            const newSelection = event.shiftKey
              ? NodeRangeSelection.create(doc, selection.$anchorNode.pos, nextBlock.pos)
              : NodeRangeSelection.create(doc, nextBlock.pos);
            view.dispatch(view.state.tr.setSelection(newSelection));
            event.preventDefault();
            return true;
          }
        }
      }
      return false;
    },

    handleDOMEvents: {
      mousedown(view, event) {
        if (event.button !== 0) return false;
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (!pos) return false;

        if (event.shiftKey && view.state.selection instanceof NodeRangeSelection) {
          const block = findBlockAt(view.state.doc, pos.pos);
          if (block) {
            view.dispatch(
              view.state.tr.setSelection(
                NodeRangeSelection.create(
                  view.state.doc,
                  (view.state.selection as NodeRangeSelection).$anchorNode.pos,
                  block.pos
                )
              )
            );
            event.preventDefault();
            return true;
          }
        }

        const block = findBlockAt(view.state.doc, pos.pos);
        if (block) {
          view.dispatch(view.state.tr.setMeta('block-select-drag', { dragging: false, startPos: block.pos }));
        }
        return false;
      },

      mousemove(view, event) {
        const pluginState = blockSelectPlugin.getState(view.state);
        if (!pluginState || pluginState.startPos === null) return false;

        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
        const currentBlock = pos ? findBlockAt(view.state.doc, pos.pos) : null;

        if (currentBlock && currentBlock.pos !== pluginState.startPos) {
          view.dispatch(
            view.state.tr
              .setSelection(NodeRangeSelection.create(view.state.doc, pluginState.startPos, currentBlock.pos))
              .setMeta('block-select-drag', { dragging: true, startPos: pluginState.startPos })
          );
          event.preventDefault();
          return true;
        }
        return false;
      },

      mouseup(view, event) {
        const pluginState = blockSelectPlugin.getState(view.state);
        if (!pluginState) return false;
        const wasDragging = pluginState.dragging;
        view.dispatch(view.state.tr.setMeta('block-select-drag', { dragging: false, startPos: null }));
        if (wasDragging) {
          event.preventDefault();
          return true;
        }
        return false;
      }
    },

    decorations(state) {
      const { selection } = state;
      if (!(selection instanceof NodeRangeSelection)) return null;
      const decos = selection.ranges.map(range =>
        Decoration.node(range.$from.pos, range.$to.pos, { class: 'ProseMirror-selectednode block-selected' })
      );
      return DecorationSet.create(state.doc, decos);
    }
  },

  view() {
    const style = document.createElement('style');
    style.textContent = `
      .ProseMirror:has(.block-selected) .ProseMirror-selectednode.block-selected {
        background: rgba(68, 142, 246, 0.15);
        border-radius: 4px;
        outline: none;
      }
      .ProseMirror:has(.block-selected) *::selection {
        background: transparent;
      }
    `;
    document.head.appendChild(style);
    return { destroy: () => style.remove() };
  }
});
