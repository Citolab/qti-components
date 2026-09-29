import { describe, beforeEach, afterEach, it, expect } from 'vitest';

import '@citolab/qti-components';

import { qtiTransformItem } from '@qti-components/transformers';

import interpolationItem from './fixtures/biologie/items/32eugm.xml?raw';
import matchItem from './fixtures/examples/items/match.xml?raw';
import numericItem from './fixtures/numeric/items/divide-compare.xml?raw';

import type { QtiAssessmentItem } from '@qti-components/elements';

/**
 * Scores real authored items, not constructed fixtures.
 *
 * "Real" here means the scoring is real, not the prose. Both fixtures keep the
 * declarations, correct responses, mapping, interpolation table and response
 * processing of items authored by hand — the parts that decide a score — while
 * their text is lorem ipsum, because the provenance of the original wording is
 * not ours to vouch for. They live under `fixtures/` the way the other e2e
 * suites keep theirs, so this suite owns its inputs and fails when scoring
 * changes rather than when a demo asset is edited.
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
   * ITM-32eugm: three sub-questions feed a RAW_SCORE of 0..3, which an
   * interpolation table maps onto a SCORE out of 2.
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
  /*
   * No item in this repo computes with `qti-divide` or `qti-math-operator` —
   * 0 of 295 — so nothing exercised numeric comparison through real response
   * processing. This item does, and it covers both halves: a fractional result
   * and a whole one, since only the whole one triggered the truncation.
   */
  describe('numeric comparison (divide-compare.xml)', () => {
    const scoreWith = async (response: string, response2: string) => {
      const item = await mount(numericItem);
      item.updateResponseVariable('RESPONSE', response);
      item.updateResponseVariable('RESPONSE2', response2);
      item.processResponse();
      return item;
    };

    it('scores full marks for both divisions answered correctly', async () => {
      const item = await scoreWith('3.5', '4');
      expect(outcome(item, 'SCORE')).toBe('2');
      expect(outcome(item, 'SCORE')).toBe(outcome(item, 'MAXSCORE'));
    });

    it('rejects a truncated answer to the fractional division', async () => {
      expect(outcome(await scoreWith('3', '4'), 'SCORE')).toBe('1');
    });

    // The whole-result half: 8/2 is 4, inferred as an integer, and "4.5" used
    // to be truncated to 4 and credited.
    it('rejects a fractional answer to the whole-number division', async () => {
      expect(outcome(await scoreWith('3.5', '4.5'), 'SCORE')).toBe('1');
    });

    it('scores nothing when both are wrong', async () => {
      expect(outcome(await scoreWith('3', '4.5'), 'SCORE')).toBe('0');
    });
  });
});
