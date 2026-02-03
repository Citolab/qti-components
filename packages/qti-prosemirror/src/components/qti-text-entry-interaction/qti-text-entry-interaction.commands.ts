import type { Command } from 'prosemirror-state';

/**
 * Command to insert a text entry interaction at the current selection
 */
export const insertTextEntryInteraction: Command = (state, dispatch) => {
  const type = state.schema.nodes.qtiTextEntryInteraction;
  if (!type) return false;

  const textEntry = type.create({
    responseIdentifier: `RESPONSE_${Date.now()}`
  });

  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(textEntry).scrollIntoView());
  }
  return true;
};
