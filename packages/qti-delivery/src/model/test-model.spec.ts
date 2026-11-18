import { DOMParser } from '@xmldom/xmldom';
import { describe, expect, it } from 'vitest';

import vectors from '../vectors/test-model.vectors.json';
import { buildTestModel, itemRefsInOrder, ownItemRefs, sectionsInOrder } from './test-model';

import type { XmlElement } from './xml-node';

const parse = (xml: string) =>
  new DOMParser().parseFromString(xml, 'text/xml').documentElement as unknown as XmlElement;

/*
 * Runs in the `node` vitest project: the model is built from the XML with xmldom, no browser and no
 * element registered. A .NET port runs the same vectors.
 */
describe('buildTestModel (test vectors)', () => {
  it.each(vectors.testModel)('$name', ({ xml, model }) => {
    expect(buildTestModel(parse(xml))).toEqual(model);
  });
});

describe('buildTestModel', () => {
  it('refuses an element that is not a qti-assessment-test', () => {
    expect(() => buildTestModel(parse('<qti-test-part identifier="p"/>'))).toThrow(TypeError);
  });

  const interleaved = () => {
    const vector = vectors.testModel.find(({ name }) => name.startsWith('a subsection between'))!;
    return buildTestModel(parse(vector.xml)).testParts[0];
  };

  it('lists sections depth first, a section before its subsections', () => {
    expect(sectionsInOrder(interleaved().sections).map(section => section.identifier)).toEqual(['outer', 'inner']);
  });

  it('lists item-refs in document order, across subsections', () => {
    expect(itemRefsInOrder(interleaved().sections).map(item => item.identifier)).toEqual(['i1', 'i2', 'i3']);
  });

  it('separates a section own item-refs from its subsections', () => {
    expect(ownItemRefs(interleaved().sections[0]).map(item => item.identifier)).toEqual(['i1', 'i3']);
  });
});
