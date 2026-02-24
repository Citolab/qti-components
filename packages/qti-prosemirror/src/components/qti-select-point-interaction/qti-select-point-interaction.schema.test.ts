import { Schema } from 'prosemirror-model';

import { qtiSelectPointInteractionNodeSpec } from './qti-select-point-interaction.schema';

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    text: { group: 'inline' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0] as const
    },
    qtiSelectPointInteraction: qtiSelectPointInteractionNodeSpec
  }
});

function elementLike(attrs: Record<string, string | null>, nestedImage?: Record<string, string | null>) {
  return {
    getAttribute: (name: string) => attrs[name] ?? null,
    querySelector: (selector: string) => {
      if (selector !== 'img' || !nestedImage) return null;
      return {
        getAttribute: (name: string) => nestedImage[name] ?? null
      };
    }
  };
}

describe('qtiSelectPointInteractionNodeSpec', () => {
  it('parses select point interaction attributes', () => {
    const rule = qtiSelectPointInteractionNodeSpec.parseDOM?.[0];
    const attrs = rule?.getAttrs?.(
      elementLike({
        'response-identifier': 'RESPONSE_1',
        'max-choices': '3',
        'min-choices': '1',
        class: 'responsive',
        'correct-response': '120 100',
        'image-src': 'data:image/png;base64,abc',
        'image-alt': 'Map',
        'image-width': '640',
        'image-height': '360',
        'area-mappings': '[{"id":"A1","shape":"circle","coords":"10,20,5","mappedValue":1,"defaultValue":0}]'
      }) as unknown as HTMLElement
    ) as Record<string, unknown>;

    expect(attrs.responseIdentifier).toBe('RESPONSE_1');
    expect(attrs.maxChoices).toBe(3);
    expect(attrs.minChoices).toBe(1);
    expect(attrs.class).toBe('responsive');
    expect(attrs.correctResponse).toBe('120 100');
    expect(attrs.imageSrc).toBe('data:image/png;base64,abc');
    expect(attrs.imageAlt).toBe('Map');
    expect(attrs.imageWidth).toBe(640);
    expect(attrs.imageHeight).toBe(360);
    expect(String(attrs.areaMappings)).toContain('"shape":"circle"');
  });

  it('falls back to nested img attrs when image attrs are missing', () => {
    const rule = qtiSelectPointInteractionNodeSpec.parseDOM?.[0];
    const attrs = rule?.getAttrs?.(
      elementLike(
        {
          'response-identifier': 'RESPONSE_2'
        },
        {
          src: '/assets/map.png',
          alt: 'Fallback map',
          width: '206',
          height: '280'
        }
      ) as unknown as HTMLElement
    ) as Record<string, unknown>;

    expect(attrs.imageSrc).toBe('/assets/map.png');
    expect(attrs.imageAlt).toBe('Fallback map');
    expect(attrs.imageWidth).toBe(206);
    expect(attrs.imageHeight).toBe(280);
  });

  it('serializes to qti-select-point-interaction attrs only', () => {
    const node = schema.nodes.qtiSelectPointInteraction.create({
      responseIdentifier: 'RESPONSE_3',
      maxChoices: 2,
      minChoices: 0,
      areaMappings: '[{"id":"A2","shape":"rect","coords":"1,2,10,20","mappedValue":1,"defaultValue":0}]'
    });

    const domSpec = qtiSelectPointInteractionNodeSpec.toDOM?.(node) as [string, Record<string, string>];
    expect(domSpec[0]).toBe('qti-select-point-interaction');
    expect(domSpec[1]['response-identifier']).toBe('RESPONSE_3');
    expect(domSpec[1]['max-choices']).toBe('2');
    expect(domSpec[1]['min-choices']).toBe('0');
    expect(domSpec[1]['area-mappings']).toContain('"shape":"rect"');
  });

  it('is configured as a block atom node', () => {
    expect(qtiSelectPointInteractionNodeSpec.group).toBe('block');
    expect(qtiSelectPointInteractionNodeSpec.atom).toBe(true);
    expect(qtiSelectPointInteractionNodeSpec.selectable).toBe(true);
    expect(qtiSelectPointInteractionNodeSpec.isolating).toBe(true);
  });
});
