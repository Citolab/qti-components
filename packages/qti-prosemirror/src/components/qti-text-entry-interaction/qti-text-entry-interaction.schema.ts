import type { DOMOutputSpec, NodeSpec } from 'prosemirror-model';

export const qtiTextEntryInteractionNodeSpec: NodeSpec = {
  attrs: {
    responseIdentifier: { default: null }
  },
  parseDOM: [
    {
      tag: 'qti-text-entry-interaction',
      getAttrs: (node: Node | string) => {
        if (!(node instanceof HTMLElement)) return {};
        return {
          responseIdentifier: node.getAttribute('response-identifier')
        };
      }
    }
  ],
  toDOM(node): DOMOutputSpec {
    const attrs: Record<string, string> = {};
    if (node.attrs.responseIdentifier) {
      attrs['response-identifier'] = node.attrs.responseIdentifier;
    }
    return ['qti-text-entry-interaction', attrs];
  },
  inline: true,
  group: 'inline',
  marks: '_',
  atom: true,
  selectable: true
};
