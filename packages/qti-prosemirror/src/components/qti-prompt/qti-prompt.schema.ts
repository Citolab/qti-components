import type { DOMOutputSpec, NodeSpec } from 'prosemirror-model';

export const qtiPromptNodeSpec: NodeSpec = {
  group: 'block',
  content: 'paragraph',
  parseDOM: [{ tag: 'qti-prompt' }],
  toDOM(): DOMOutputSpec {
    return ['qti-prompt', 0];
  }
};
