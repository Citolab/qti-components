import type { DOMOutputSpec, NodeSpec } from 'prosemirror-model';

export const qtiChoiceInteractionNodeSpec: NodeSpec = {
  group: 'block',
  content: 'qtiPrompt qtiSimpleChoice+',
  attrs: {
    maxChoices: { default: 0 },
    class: { default: null },
    correctResponse: { default: null },
    responseIdentifier: { default: null }
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
          class: className || null,
          correctResponse: node.getAttribute('correct-response'),
          responseIdentifier: node.getAttribute('response-identifier')
        };
      }
    }
  ],
  toDOM(node): DOMOutputSpec {
    const attrs: Record<string, string> = { 'max-choices': String(node.attrs.maxChoices) };
    if (node.attrs.class) attrs.class = node.attrs.class;
    if (node.attrs.correctResponse) attrs['correct-response'] = node.attrs.correctResponse;
    if (node.attrs.responseIdentifier) attrs['response-identifier'] = node.attrs.responseIdentifier;
    return ['qti-choice-interaction', attrs, 0];
  },
  defining: true,
  isolating: true
};
