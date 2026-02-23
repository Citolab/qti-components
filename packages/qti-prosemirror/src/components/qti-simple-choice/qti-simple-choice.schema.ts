import type { DOMOutputSpec, NodeSpec } from 'prosemirror-model';

export const qtiSimpleChoiceNodeSpec: NodeSpec = {
  group: 'block',
  content: 'inline*',
  attrs: {
    identifier: { default: 'A' }
  },
  parseDOM: [
    {
      tag: 'qti-simple-choice',
      getAttrs: (node: Node | string) => {
        if (!(node instanceof HTMLElement)) return {};
        return { identifier: node.getAttribute('identifier') || 'A' };
      }
    }
  ],
  toDOM(node): DOMOutputSpec {
    return ['qti-simple-choice', { identifier: node.attrs.identifier }, 0];
  }
};
