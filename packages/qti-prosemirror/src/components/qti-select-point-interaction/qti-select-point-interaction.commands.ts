import type { Command } from 'prosemirror-state';

/**
 * Command to insert a select point interaction at the current selection.
 */
export const insertSelectPointInteraction: Command = (state, dispatch) => {
  const { schema } = state;
  const interactionType = schema.nodes.qtiSelectPointInteraction;

  if (!interactionType) return false;

  const timestamp = Date.now();
  const interaction = interactionType.create({
    responseIdentifier: `RESPONSE_${timestamp}`,
    maxChoices: 0,
    minChoices: 0,
    areaMappings: '[]'
  });

  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(interaction).scrollIntoView());
  }

  return true;
};
