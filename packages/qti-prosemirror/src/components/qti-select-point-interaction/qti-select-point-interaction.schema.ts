import type { DOMOutputSpec, NodeSpec } from 'prosemirror-model';

type SelectPointDomAttrs = {
  responseIdentifier: string | null;
  maxChoices: number;
  minChoices: number;
  class: string | null;
  correctResponse: string | null;
  imageSrc: string | null;
  imageAlt: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  areaMappings: string;
};

function parseNumberAttribute(value: string | null): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isElementLike(node: unknown): node is { getAttribute: (name: string) => string | null; querySelector: (s: string) => any } {
  return (
    typeof node === 'object' &&
    node !== null &&
    typeof (node as { getAttribute?: unknown }).getAttribute === 'function' &&
    typeof (node as { querySelector?: unknown }).querySelector === 'function'
  );
}

function parseSelectPointAttrs(node: { getAttribute: (name: string) => string | null; querySelector: (s: string) => any }): SelectPointDomAttrs {
  const nestedImage = node.querySelector('img');

  const imageSrc = node.getAttribute('image-src') || nestedImage?.getAttribute('src') || null;
  const imageAlt = node.getAttribute('image-alt') || nestedImage?.getAttribute('alt') || null;

  const imageWidth =
    parseNumberAttribute(node.getAttribute('image-width')) ?? parseNumberAttribute(nestedImage?.getAttribute('width') || null);
  const imageHeight =
    parseNumberAttribute(node.getAttribute('image-height')) ??
    parseNumberAttribute(nestedImage?.getAttribute('height') || null);

  return {
    responseIdentifier: node.getAttribute('response-identifier'),
    maxChoices: parseNumberAttribute(node.getAttribute('max-choices')) ?? 0,
    minChoices: parseNumberAttribute(node.getAttribute('min-choices')) ?? 0,
    class: node.getAttribute('class') || null,
    correctResponse: node.getAttribute('correct-response'),
    imageSrc,
    imageAlt,
    imageWidth,
    imageHeight,
    areaMappings: node.getAttribute('area-mappings') || '[]'
  };
}

export const qtiSelectPointInteractionNodeSpec: NodeSpec = {
  group: 'block',
  atom: true,
  selectable: true,
  isolating: true,
  attrs: {
    responseIdentifier: { default: null },
    maxChoices: { default: 0 },
    minChoices: { default: 0 },
    class: { default: null },
    correctResponse: { default: null },
    imageSrc: { default: null },
    imageAlt: { default: null },
    imageWidth: { default: null },
    imageHeight: { default: null },
    areaMappings: { default: '[]' }
  },
  parseDOM: [
    {
      tag: 'qti-select-point-interaction',
      getAttrs: (node: Node | string) => {
        if (!isElementLike(node)) return {};
        return parseSelectPointAttrs(node);
      }
    }
  ],
  toDOM(node): DOMOutputSpec {
    const attrs: Record<string, string> = {
      'max-choices': String(node.attrs.maxChoices ?? 0),
      'min-choices': String(node.attrs.minChoices ?? 0),
      'area-mappings': String(node.attrs.areaMappings ?? '[]')
    };

    if (node.attrs.responseIdentifier) attrs['response-identifier'] = String(node.attrs.responseIdentifier);
    if (node.attrs.class) attrs.class = String(node.attrs.class);
    if (node.attrs.correctResponse) attrs['correct-response'] = String(node.attrs.correctResponse);
    if (node.attrs.imageSrc) attrs['image-src'] = String(node.attrs.imageSrc);
    if (node.attrs.imageAlt) attrs['image-alt'] = String(node.attrs.imageAlt);
    if (node.attrs.imageWidth != null) attrs['image-width'] = String(node.attrs.imageWidth);
    if (node.attrs.imageHeight != null) attrs['image-height'] = String(node.attrs.imageHeight);

    return ['qti-select-point-interaction', attrs];
  }
};
