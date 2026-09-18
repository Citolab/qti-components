import { describe, beforeEach, afterEach, it, expect } from 'vitest';

import '@citolab/qti-components';

import { qtiTransformItem } from '@qti-components/transformers';

import interpolationItem from './fixtures/biologie/items/32eugm.xml?raw';
import matchItem from './fixtures/examples/items/match.xml?raw';

import type { QtiAssessmentItem } from '@qti-components/elements';

/**
 * Scores real authored items, not constructed fixtures.
 *
 * The two items are copies of shipped content (`public/assets/api/biologie` and
 * `.../examples`), taken under `fixtures/` the way the other e2e suites take
 * theirs. They are inputs this suite owns: the originals are demo assets that
 * get edited for unrelated reasons, and a scoring regression test should fail
 * because scoring changed, not because a demo was restyled.
 *
 * Three recent changes alter how a score is computed — interpolation tables
 * matching on ranges, directed pairs respecting their direction, and expression
 * results no longer all claiming to be integers. Unit specs prove each rule in
 * isolation; this proves the items shipped in this repo still come out right,
 * which is the part a synthetic fixture cannot tell you.
 */
describe('scoring real items', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => container.remove());

  const mount = async (xml: string): Promise<QtiAssessmentItem> => {
    container.innerHTML = qtiTransformItem().parse(xml).html();
    const item = container.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await item.updateComplete;
    return item;
  };

  const outcome = (item: QtiAssessmentItem, identifier: string) =>
    item.variables.find(v => v.identifier === identifier)?.value;

  /*
   * A Cito item (ITM-32eugm): three sub-questions feed a RAW_SCORE of 0..3,
   * which an interpolation table maps onto a SCORE out of 2.
   *
   * Its table omits `include-boundary`, so every entry defaults to including
   * its bound — which is why range matching gives this item exactly the same
   * scores as the exact matching it used to get. The fixture that visibly
   * changed sets `include-boundary="false"`; this authored item does not.
   */
  describe('interpolation table (ITM-32eugm)', () => {
    const answers = { RESPONSE: 'C', RESPONSE2: 'E', RESPONSE3: 'D' };

    const scoreWith = async (given: Partial<typeof answers>) => {
      const item = await mount(interpolationItem);
      for (const [identifier, value] of Object.entries(given)) {
        item.updateResponseVariable(identifier, value);
      }
      item.processResponse();
      return item;
    };

    it('scores full marks for a fully correct response', async () => {
      const item = await scoreWith(answers);
      expect(outcome(item, 'RAW_SCORE')).toBe('3');
      expect(outcome(item, 'SCORE')).toBe('2');
      // The whole point of MAXSCORE: a correct candidate reaches it.
      expect(outcome(item, 'SCORE')).toBe(outcome(item, 'MAXSCORE'));
    });

    it('gives partial credit for two of three', async () => {
      const item = await scoreWith({ RESPONSE: 'C', RESPONSE2: 'E' });
      expect(outcome(item, 'RAW_SCORE')).toBe('2');
      expect(outcome(item, 'SCORE')).toBe('1');
    });

    it('gives nothing for one of three', async () => {
      const item = await scoreWith({ RESPONSE: 'C' });
      expect(outcome(item, 'RAW_SCORE')).toBe('1');
      expect(outcome(item, 'SCORE')).toBe('0');
    });

    it('gives nothing for an entirely wrong response', async () => {
      const item = await scoreWith({ RESPONSE: 'A', RESPONSE2: 'A', RESPONSE3: 'A' });
      expect(outcome(item, 'RAW_SCORE')).toBe('0');
      expect(outcome(item, 'SCORE')).toBe('0');
    });
  });

  /*
   * A match interaction mapping directed pairs onto partial credit, scored by
   * the map_response template. Mapping goes through the same comparison that
   * used to ignore a directed pair's direction.
   */
  describe('directed pairs (match.xml)', () => {
    const correct = ['C R', 'D M', 'L M', 'P T'];

    const scoreWith = async (response: string[]) => {
      const item = await mount(matchItem);
      item.updateResponseVariable('RESPONSE', response);
      item.processResponse();
      return item;
    };

    it('scores the mapped total for the correct response', async () => {
      // 1 + 0.5 + 0.5 + 1
      expect(outcome(await scoreWith(correct), 'SCORE')).toBe('3');
    });

    it('scores each pair independently', async () => {
      expect(outcome(await scoreWith(['C R']), 'SCORE')).toBe('1');
      expect(outcome(await scoreWith(['D M']), 'SCORE')).toBe('0.5');
    });

    // The bug this pins: both operands were sorted before comparison, so a pair
    // matched its map entry whichever way round the candidate gave it.
    it('does not credit a pair given the wrong way round', async () => {
      expect(outcome(await scoreWith(['R C']), 'SCORE')).toBe('0');
    });

    it('credits only the correctly directed pairs of a mixed response', async () => {
      expect(outcome(await scoreWith(['C R', 'M D']), 'SCORE')).toBe('1');
    });
  });
});
