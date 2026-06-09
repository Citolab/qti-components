const xml = String.raw;

import { afterEach, vi } from 'vitest';

import { qtiTransformItem } from '../src/qti-transform-item';

const choiceItem = (choices: string) => xml`
  <qti-assessment-item identifier="ITM-1" xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
    <qti-item-body>
      <qti-choice-interaction response-identifier="RESPONSE" shuffle="true" max-choices="1">
        ${choices}
      </qti-choice-interaction>
    </qti-item-body>
  </qti-assessment-item>`;

const simpleChoice = (id: string, fixed = false) =>
  `<qti-simple-choice identifier="${id}"${fixed ? ' fixed="true"' : ''}>${id}</qti-simple-choice>`;

const FIVE = choiceItem(['A', 'B', 'C', 'D', 'E'].map(id => simpleChoice(id)).join('\n'));

const order = (xmlStr: string, seed: string | number): string[] => {
  const doc = qtiTransformItem().parse(xmlStr).shuffleInteractions(seed).xmlDoc();
  return Array.from(doc.getElementsByTagName('*'))
    .filter(e => e.localName === 'qti-simple-choice')
    .map(e => e.getAttribute('identifier') ?? '');
};

const orderUnseeded = (xmlStr: string): string[] => {
  const doc = qtiTransformItem().parse(xmlStr).shuffleInteractions().xmlDoc();
  return Array.from(doc.getElementsByTagName('*'))
    .filter(e => e.localName === 'qti-simple-choice')
    .map(e => e.getAttribute('identifier') ?? '');
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('shuffleInteractions (seeded)', () => {
  it('is deterministic for the same seed', () => {
    expect(order(FIVE, 'seed-x')).toEqual(order(FIVE, 'seed-x'));
  });

  it('is a permutation of the choices', () => {
    expect([...order(FIVE, 'seed-x')].sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('reorders for at least one seed', () => {
    const identity = ['A', 'B', 'C', 'D', 'E'];
    const someReordered = [0, 1, 2, 3, 4].some(s => JSON.stringify(order(FIVE, s)) !== JSON.stringify(identity));
    expect(someReordered).toBe(true);
  });

  it('different seeds generally produce different orders', () => {
    expect(order(FIVE, 'A')).not.toEqual(order(FIVE, 'B'));
  });

  it('keeps a fixed choice in its authored position', () => {
    const doc = choiceItem(
      [
        simpleChoice('A'),
        simpleChoice('B', true), // fixed at index 1
        simpleChoice('C'),
        simpleChoice('D'),
        simpleChoice('E')
      ].join('\n')
    );
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      expect(order(doc, seed)[1]).toBe('B');
    }
  });
});

describe('shuffleInteractions (no seed)', () => {
  it('is a permutation of the choices', () => {
    expect([...orderUnseeded(FIVE)].sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('keeps a fixed choice in its authored position', () => {
    const doc = choiceItem(
      [simpleChoice('A'), simpleChoice('B', true), simpleChoice('C'), simpleChoice('D'), simpleChoice('E')].join('\n')
    );
    expect(orderUnseeded(doc)[1]).toBe('B');
  });

  it('is deterministic across runs when seed is omitted', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(orderUnseeded(FIVE)).toEqual(orderUnseeded(FIVE));
  });

  it('does not use Math.random when seed is omitted', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.25);
    orderUnseeded(FIVE);
    expect(randomSpy).not.toHaveBeenCalled();
  });

  it('warns about the deterministic fallback seed when seed is omitted', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    orderUnseeded(FIVE);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('deterministic fallback seed'));
  });

  it('does not use Math.random when a seed is supplied', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.25);
    order(FIVE, 'seed-x');
    expect(randomSpy).not.toHaveBeenCalled();
  });
});
