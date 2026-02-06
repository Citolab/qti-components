import type { DOMOutputSpec, MarkSpec, NodeSpec } from 'prosemirror-model';

// Base nodes needed for any ProseMirror document
export const baseNodes: Record<string, NodeSpec> = {
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
  heading: {
    group: 'block',
    content: 'inline*',
    attrs: { level: { default: 1 } },
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
      { tag: 'h4', attrs: { level: 4 } },
      { tag: 'h5', attrs: { level: 5 } },
      { tag: 'h6', attrs: { level: 6 } }
    ],
    toDOM(node): DOMOutputSpec {
      return [`h${node.attrs.level}`, 0];
    }
  }
};

// Base marks for inline formatting
export const baseMarks: Record<string, MarkSpec> = {
  bold: {
    parseDOM: [{ tag: 'strong' }, { tag: 'b' }],
    toDOM(): DOMOutputSpec {
      return ['strong', 0];
    }
  },
  italic: {
    parseDOM: [{ tag: 'em' }, { tag: 'i' }],
    toDOM(): DOMOutputSpec {
      return ['em', 0];
    }
  }
};
