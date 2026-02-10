import type { DOMOutputSpec, NodeSpec } from 'prosemirror-model';

export const qtiInlineChoiceNodeSpec: NodeSpec = {
  attrs: {
    identifier: { default: 'A' }
  },
  content: 'inline*',
  group: 'block',
  parseDOM: [
    {
      tag: 'qti-inline-choice',
      getAttrs: (node: Node | string) => {
        if (!(node instanceof HTMLElement)) return {};
        return { identifier: node.getAttribute('identifier') || 'A' };
      }
    }
  ],
  toDOM(node): DOMOutputSpec {
    return ['qti-inline-choice', { identifier: node.attrs.identifier }, 0];
  },
  selectable: true
};
