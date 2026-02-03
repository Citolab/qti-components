import { keymap } from 'prosemirror-keymap';

import { insertTextEntryInteraction } from './qti-text-entry-interaction.commands';

import type { Plugin } from 'prosemirror-state';

/**
 * Create the keymap plugin for text entry interactions
 * - Mod-Shift-T: Insert a text entry interaction
 */
export function createTextEntryInteractionKeymap(): Plugin {
  return keymap({
    'Mod-Shift-t': insertTextEntryInteraction
  });
}
