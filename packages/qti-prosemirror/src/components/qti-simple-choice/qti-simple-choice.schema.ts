import type { DOMOutputSpec, NodeSpec } from 'prosemirror-model';

export const qtiSimpleChoiceImageNodeSpec: NodeSpec = {
  inline: true,
  atom: true,
  selectable: true,
  attrs: {
    src: { default: null },
    alt: { default: null }
  },
  parseDOM: [
    {
      tag: 'img[src]',
      context: 'qtiSimpleChoiceParagraph/',
      getAttrs: (node: Node | string) => {
        if (!(node instanceof HTMLElement)) return false;
        return {
          src: node.getAttribute('src'),
          alt: node.getAttribute('alt')
        };
      }
    }
  ],
  toDOM(node): DOMOutputSpec {
    const attrs: Record<string, string> = {};
    if (node.attrs.src) attrs.src = node.attrs.src;
    if (node.attrs.alt) attrs.alt = node.attrs.alt;
    return ['img', attrs];
  },
  marks: ''
};

export const qtiSimpleChoiceParagraphNodeSpec: NodeSpec = {
  content: 'text* | qtiSimpleChoiceImage',
  marks: 'bold',
  parseDOM: [{ tag: 'p', context: 'qtiSimpleChoice/' }],
  toDOM(): DOMOutputSpec {
    return ['p', 0];
  }
};

export const qtiSimpleChoiceNodeSpec: NodeSpec = {
  group: 'block',
  content: 'qtiSimpleChoiceParagraph',
  attrs: {
    identifier: { default: 'SIMPLE-CHOICE-IDENTIFIER' }
  },
  parseDOM: [
    {
      tag: 'qti-simple-choice',
      getAttrs: (node: Node | string) => {
        if (!(node instanceof HTMLElement)) return {};
        return { identifier: node.getAttribute('identifier') || 'SIMPLE-CHOICE-IDENTIFIER' };
      }
    }
  ],
  toDOM(node): DOMOutputSpec {
    return ['qti-simple-choice', { identifier: node.attrs.identifier }, 0];
  }
};
