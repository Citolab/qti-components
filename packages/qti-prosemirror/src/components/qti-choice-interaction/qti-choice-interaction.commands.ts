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
  const promptType = schema.nodes.qtiPrompt;
  const choiceType = schema.nodes.qtiSimpleChoice;
  const choiceParagraphType = schema.nodes.qtiSimpleChoiceParagraph;
  const interactionType = schema.nodes.qtiChoiceInteraction;

  if (!promptType || !choiceType || !choiceParagraphType || !interactionType) return false;

  const timestamp = Date.now();
  const prompt = promptType.create(null, schema.nodes.paragraph.create(null, schema.text('Which option is correct?')));

  const choices = [
    choiceType.create(
      { identifier: `CHOICE_${timestamp}_A` },
      choiceParagraphType.create(null, schema.text('Option A'))
    ),
    choiceType.create(
      { identifier: `CHOICE_${timestamp}_B` },
      choiceParagraphType.create(null, schema.text('Option B'))
    ),
    choiceType.create(
      { identifier: `CHOICE_${timestamp}_C` },
      choiceParagraphType.create(null, schema.text('Option C'))
    )
  ];

  const interaction = interactionType.create({ responseIdentifier: `CHOICE_${timestamp}`, maxChoices: 1 }, [
    prompt,
    ...choices
  ]);

  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(interaction).scrollIntoView());
  }
  return true;
};
