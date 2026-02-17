import type { DOMOutputSpec, NodeSpec } from 'prosemirror-model';

export const qtiInlineChoiceInteractionNodeSpec: NodeSpec = {
  attrs: {
    responseIdentifier: { default: null },
    shuffle: { default: false },
    class: { default: null },
    correctResponse: { default: null }
  },
  content: 'qtiInlineChoice+',
  group: 'block',
  parseDOM: [
    {
      tag: 'qti-inline-choice-interaction',
      getAttrs: (node: Node | string) => {
        if (!(node instanceof HTMLElement)) return {};
        return {
          responseIdentifier: node.getAttribute('response-identifier'),
          shuffle: node.getAttribute('shuffle') === 'true',
          class: node.getAttribute('class') || null,
          correctResponse: node.getAttribute('correct-response')
        };
      }
    }
  ],
  toDOM(node): DOMOutputSpec {
    const attrs: Record<string, string> = {};

    if (node.attrs.responseIdentifier) {
      attrs['response-identifier'] = node.attrs.responseIdentifier;
    }
    if (node.attrs.correctResponse) {
      attrs['correct-response'] = node.attrs.correctResponse;
    }
    attrs.shuffle = String(Boolean(node.attrs.shuffle));

    if (node.attrs.class) {
      attrs.class = node.attrs.class;
    }

    return ['qti-inline-choice-interaction', attrs, 0];
  },
  selectable: true,
  isolating: true
};
