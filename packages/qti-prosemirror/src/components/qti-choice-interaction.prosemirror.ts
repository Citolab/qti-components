import { Schema } from 'prosemirror-model';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';

import type { DOMOutputSpec, NodeSpec, MarkSpec } from 'prosemirror-model';

// Simple schema with just basic nodes for QTI Choice Interaction
const nodes: Record<string, NodeSpec> = {
  doc: {
    content: 'block+'
  },
  text: {
    group: 'inline'
  },
  paragraph: {
    group: 'block',
    content: 'inline*',
    parseDOM: [{ tag: 'p' }],
    toDOM(): DOMOutputSpec {
      return ['p', 0];
    }
  },
  qtiChoiceInteraction: {
    group: 'block',
    content: 'qtiPrompt qtiSimpleChoice+',
    attrs: {
      maxChoices: { default: 0 },
      class: { default: null }
    },
    parseDOM: [
      {
        tag: 'qti-choice-interaction',
        getAttrs: (node: Node | string) => {
          if (!(node instanceof HTMLElement)) return {};
          const maxChoices = node.getAttribute('max-choices');
          const className = node.getAttribute('class');
          return {
            maxChoices: maxChoices ? parseInt(maxChoices, 10) : 0,
            class: className || null
          };
        }
      }
    ],
    toDOM(node): DOMOutputSpec {
      const attrs: Record<string, string> = { 'max-choices': String(node.attrs.maxChoices) };
      if (node.attrs.class) attrs.class = node.attrs.class;
      return ['qti-choice-interaction', attrs, 0];
    }
  },
  qtiPrompt: {
    group: 'block',
    content: 'paragraph',
    parseDOM: [{ tag: 'qti-prompt' }],
    toDOM(): DOMOutputSpec {
      return ['qti-prompt', 0];
    }
  },
  qtiSimpleChoice: {
    group: 'block',
    content: 'inline*',
    attrs: {
      identifier: { default: 'A' }
    },
    parseDOM: [{ tag: 'qti-simple-choice' }],
    toDOM(node): DOMOutputSpec {
      return ['qti-simple-choice', { identifier: node.attrs.identifier }, 0];
    }
  }
};

const marks: Record<string, MarkSpec> = {
  bold: {
    parseDOM: [{ tag: 'strong' }, { tag: 'b' }],
    toDOM(): DOMOutputSpec {
      return ['strong', 0];
    }
  }
};

export const qtiChoiceInteractionSchema = new Schema({ nodes, marks });

// Simple function to create a QTI Choice Interaction
export const createQtiChoiceInteraction = (
  schema: Schema,
  promptText = 'Select an option:',
  choices = ['Option A', 'Option B']
) => {
  const prompt = schema.node('qtiPrompt', null, [schema.node('paragraph', null, [schema.text(promptText)])]);

  const choiceNodes = choices.map((choice, index) =>
    schema.node('qtiSimpleChoice', { identifier: String.fromCharCode(65 + index) }, [schema.text(choice)])
  );

  return schema.node('qtiChoiceInteraction', null, [prompt, ...choiceNodes]);
};

// Simple plugins setup
export const qtiChoiceInteractionPlugins = [history(), keymap(baseKeymap)];

// Function to insert a new choice interaction at cursor position
export const insertQtiChoiceInteraction = (view: any) => {
  const { state, dispatch } = view;
  const interaction = createQtiChoiceInteraction(state.schema);
  const tr = state.tr.replaceSelectionWith(interaction);
  dispatch(tr);
};
