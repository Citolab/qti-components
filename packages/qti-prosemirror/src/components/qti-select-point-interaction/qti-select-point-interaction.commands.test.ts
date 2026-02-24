import { Schema } from 'prosemirror-model';
import { AllSelection, EditorState } from 'prosemirror-state';

import { insertSelectPointInteraction } from './qti-select-point-interaction.commands';
import { qtiSelectPointInteractionNodeSpec } from './qti-select-point-interaction.schema';

import type { NodeSpec } from 'prosemirror-model';

const baseNodes = {
  doc: { content: 'block+' },
  text: { group: 'inline' },
  paragraph: {
    group: 'block',
    content: 'inline*',
    parseDOM: [{ tag: 'p' }],
    toDOM: () => ['p', 0] as const
  }
} satisfies Record<string, NodeSpec>;

describe('insertSelectPointInteraction', () => {
  it('returns false when schema does not include qtiSelectPointInteraction', () => {
    const schema = new Schema({ nodes: baseNodes });
    const state = EditorState.create({
      schema,
      doc: schema.node('doc', null, [schema.node('paragraph')])
    });

    const result = insertSelectPointInteraction(state, undefined);

    expect(result).toBe(false);
  });

  it('inserts a select point interaction node with default attrs', () => {
    const schema = new Schema({
      nodes: {
        ...baseNodes,
        qtiSelectPointInteraction: qtiSelectPointInteractionNodeSpec
      }
    });

    let state = EditorState.create({
      schema,
      doc: schema.node('doc', null, [schema.node('paragraph')])
    });

    state = state.apply(state.tr.setSelection(new AllSelection(state.doc)));

    let nextState: EditorState | null = null;

    const result = insertSelectPointInteraction(state, tr => {
      nextState = state.apply(tr);
    });

    expect(result).toBe(true);
    expect(nextState).not.toBeNull();

    const inserted = nextState?.doc.firstChild;
    expect(inserted?.type.name).toBe('qtiSelectPointInteraction');
    expect(inserted?.attrs.responseIdentifier).toMatch(/^RESPONSE_\d+$/);
    expect(inserted?.attrs.maxChoices).toBe(0);
    expect(inserted?.attrs.minChoices).toBe(0);
    expect(inserted?.attrs.areaMappings).toBe('[]');
  });
});
