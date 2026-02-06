import type { DOMOutputSpec, NodeSpec } from 'prosemirror-model';

export const qtiChoiceInteractionNodeSpec: NodeSpec = {
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
  },
  defining: true,
  isolating: true
};
