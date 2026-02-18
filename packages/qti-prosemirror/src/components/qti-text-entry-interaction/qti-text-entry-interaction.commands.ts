import type { Command, EditorState } from 'prosemirror-state';

const isInsideInteraction = (state: EditorState): boolean => {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth >= 0; depth -= 1) {
    const nodeTypeName = $from.node(depth).type.name;

    console.log('Checking node type:', nodeTypeName);

    // Disallow inside any node whose type name ends with 'Interaction'
    if (nodeTypeName.endsWith('Interaction')) {
      return true;
    }
  }
  return false;
};

export const canInsertTextEntryInteraction = (state: EditorState): boolean => {
  const type = state.schema.nodes.qtiTextEntryInteraction;
  if (!type) return false;
  if (isInsideInteraction(state)) return false;
  return true;
};

/**
 * Command to insert a text entry interaction at the current selection
 */
export const insertTextEntryInteraction: Command = (state, dispatch) => {
  if (!canInsertTextEntryInteraction(state)) return false;

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
