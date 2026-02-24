/**
 * Base ProseMirror plugins
 *
 * A minimal but functional set of plugins for editing:
 * - history: Undo/redo support
 * - gapCursor: Allows cursor placement at positions not normally accessible
 * - dropCursor: Shows cursor position when dragging content
 * - baseKeymap: Standard editing keys (Enter, Backspace, etc.)
 * - mark keymaps: Bold (Mod-b), Italic (Mod-i)
 */

import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { history, undo, redo } from 'prosemirror-history';
import { gapCursor } from 'prosemirror-gapcursor';
import { dropCursor } from 'prosemirror-dropcursor';

import { insertTextEntryInteraction } from '../../components/qti-text-entry-interaction/qti-text-entry-interaction.commands';
import { insertChoiceInteraction } from '../../components/qti-choice-interaction/qti-choice-interaction.commands';
import { insertInlineChoiceInteraction } from '../../components/qti-inline-choice-interaction/qti-inline-choice-interaction.commands';
import { insertSelectPointInteraction } from '../../components/qti-select-point-interaction/qti-select-point-interaction.commands';
import { blockSelectPlugin } from './block-select-plugin';
import { nodeAttrsSyncPlugin } from './node-attrs-sync-plugin';

import type { Plugin } from 'prosemirror-state';
import type { Schema } from 'prosemirror-model';

/**
 * Creates a keymap for toggling marks (bold, italic)
 */
export function createMarkKeymaps(schema: Schema): Plugin {
  const bindings: Record<string, any> = {};

  if (schema.marks.bold) {
    bindings['Mod-b'] = toggleMark(schema.marks.bold);
  }
  if (schema.marks.italic) {
    bindings['Mod-i'] = toggleMark(schema.marks.italic);
  }

  return keymap(bindings);
}

// stupid globe drag image issue workaround
const img = new Image();
img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

document.addEventListener('dragstart', event => {
  event?.dataTransfer?.setDragImage(img, 0, 0);
});

/**
 * Creates a keymap for history (undo/redo)
 */
export function createHistoryKeymap(): Plugin {
  return keymap({
    'Mod-z': undo,
    'Mod-Shift-z': redo,
    'Mod-y': redo,
    'Mod-Shift-t': insertTextEntryInteraction,
    'Mod-Shift-c': insertChoiceInteraction,
    'Mod-Shift-l': insertInlineChoiceInteraction,
    'Mod-Shift-p': insertSelectPointInteraction
  });
}

/**
 * Creates the base set of plugins for a functional editor
 */
export function createBasePlugins(schema: Schema): Plugin[] {
  return [
    history(),
    createHistoryKeymap(),
    createMarkKeymaps(schema),
    gapCursor(),
    dropCursor(),
    keymap(baseKeymap),
    blockSelectPlugin,
    nodeAttrsSyncPlugin
  ];
}
