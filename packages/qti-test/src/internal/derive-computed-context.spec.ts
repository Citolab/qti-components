import { describe, expect, it } from 'vitest';

import { buildTestModel } from '@qti-components/delivery';

import { deriveComputedContext } from './derive-computed-context';

import type { ComputedContextInputs } from './derive-computed-context';

const testXml = `<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T" title="Derive">
  <qti-test-part identifier="P" navigation-mode="nonlinear" submission-mode="individual">
    <qti-assessment-section identifier="S" title="S" visible="true">
      <qti-item-session-control max-attempts="2"></qti-item-session-control>
      <qti-assessment-item-ref identifier="I1" href="i1.xml"></qti-assessment-item-ref>
      <qti-assessment-item-ref identifier="I2" href="i2.xml" category="info"></qti-assessment-item-ref>
      <qti-assessment-item-ref identifier="I3" href="i3.xml"></qti-assessment-item-ref>
    </qti-assessment-section>
  </qti-test-part>
</qti-assessment-test>`;

const model = buildTestModel(new DOMParser().parseFromString(testXml, 'application/xml').documentElement);

const inputs = (): ComputedContextInputs => ({
  model,
  infoItemCategory: 'info',
  optimality: new Map([['I1', 'suboptimal']]),
  sessionContext: { navPartId: 'P', navSectionId: 'S', navItemRefId: 'I3', view: 'candidate' },
  testContext: {
    items: [
      {
        identifier: 'I1',
        variables: [
          { identifier: 'numAttempts', type: 'response', value: '2' },
          { identifier: 'completionStatus', type: 'outcome', value: 'completed' },
          { identifier: 'SCORE', type: 'outcome', value: '0' },
          { identifier: 'MAXSCORE', type: 'outcome', value: '1' }
        ]
      }
    ]
  },
  itemData: [{ identifier: 'I3', name: 'Third' }]
});

describe('deriveComputedContext', () => {
  it('gives an equal context for the same inputs, and never changes them', () => {
    const given = inputs();
    const before = structuredClone({ ...given, model: given.model });
    const first = deriveComputedContext(given);
    expect(deriveComputedContext(given)).toEqual(first);
    expect({ ...given, model: given.model }).toEqual(before);
  });

  it('reads the position, numbers, attempts and done from the inputs alone', () => {
    const [part] = deriveComputedContext(inputs()).testParts;
    const [section] = part.sections;
    expect(part.active).toBe(true);
    expect(section).toMatchObject({ active: true, completed: false });
    expect(section.items.map(item => [item.identifier, item.index, item.active])).toEqual([
      ['I1', 1, false],
      ['I2', null, false],
      ['I3', 2, true]
    ]);
    // Two attempts of two, the last one not optimal: done, and its score read from this context.
    expect(section.items[0]).toMatchObject({ numAttempts: 2, done: true, optimal: false, score: 0, maxScore: 1 });
    expect(section.items[2]).toMatchObject({ name: 'Third', numAttempts: 0, done: false });
  });

  it('builds each context anew: a field the inputs no longer hold is gone', () => {
    const given = inputs();
    deriveComputedContext(given);
    const next = deriveComputedContext({ ...given, itemData: [] });
    expect(next.testParts[0].sections[0].items[2]).not.toHaveProperty('name');
  });
});
