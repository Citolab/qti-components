/**
 * QTI Choice Interaction Commands
 *
 * ProseMirror commands for inserting and manipulating choice interactions.
 */

import type { Command } from 'prosemirror-state';

/**
 * Command to insert a choice interaction at the current selection
 */
export const insertChoiceInteraction: Command = (state, dispatch) => {
  const { schema } = state;
  const promptType = schema.nodes.qti_prompt;
  const choiceType = schema.nodes.qti_simple_choice;
  const interactionType = schema.nodes.qti_choice_interaction;

  if (!promptType || !choiceType || !interactionType) return false;

  const prompt = promptType.create(null, schema.nodes.paragraph.create(null, schema.text('Which option is correct?')));

  const choices = [
    choiceType.create(
      { identifier: 'CHOICE_${Date.now()}' },
      schema.nodes.paragraph.create(null, schema.text('Option A'))
    ),
    choiceType.create(
      { identifier: 'CHOICE_${Date.now()}' },
      schema.nodes.paragraph.create(null, schema.text('Option B'))
    ),
    choiceType.create(
      { identifier: 'CHOICE_${Date.now()}' },
      schema.nodes.paragraph.create(null, schema.text('Option C'))
    )
  ];

  const interaction = interactionType.create({ responseIdentifier: `CHOICE_${Date.now()}`, maxChoices: 1 }, [
    prompt,
    ...choices
  ]);

  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(interaction).scrollIntoView());
  }
  return true;
};
