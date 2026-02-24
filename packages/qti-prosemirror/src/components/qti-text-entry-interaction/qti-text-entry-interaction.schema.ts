import type { DOMOutputSpec, NodeSpec } from 'prosemirror-model';

export const qtiTextEntryInteractionNodeSpec: NodeSpec = {
  attrs: {
    responseIdentifier: { default: null },
    correctResponse: { default: null }
  },
  parseDOM: [
    {
      tag: 'qti-text-entry-interaction',
      getAttrs: (node: Node | string) => {
        if (!(node instanceof HTMLElement)) return {};
        return {
          responseIdentifier: node.getAttribute('response-identifier'),
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
    return ['qti-text-entry-interaction', attrs];
  },
  inline: true,
  group: 'inline',
  marks: '_',
  atom: true,
  selectable: true
};
