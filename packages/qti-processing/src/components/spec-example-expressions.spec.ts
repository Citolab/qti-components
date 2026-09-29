import '@citolab/qti-components';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * The calculation patterns the QTI implementation guide's worked examples are
 * built from, evaluated as expression trees.
 *
 * These are the shapes, not the items: the published examples are template
 * processing wrapped around these trees, and reconstructing whole items from
 * the fragments would mean inventing the declarations and bodies around them.
 * The arithmetic is the part worth pinning, and it exercises what an item bank
 * doing real calculation would hit — a constant divided by an integer, a
 * trig function over a product, a mean scaled and rounded back down, and a
 * division rounded to an integer.
 */
describe('calculation patterns from the QTI worked examples', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => container.remove());

  const calculate = (markup: string, selector: string) => {
    container.innerHTML = markup;
    return (container.querySelector(selector) as HTMLElement & { calculate: () => unknown }).calculate();
  };

  describe('degrees to radians, then a trig function', () => {
    // `qti-math-constant` is the element this pattern needs; until recently
    // there was none, so the whole expression was inert.
    it('divides pi by 180', () => {
      expect(
        calculate(
          `<qti-divide>
             <qti-math-constant name="pi"></qti-math-constant>
             <qti-base-value base-type="integer">180</qti-base-value>
           </qti-divide>`,
          'qti-divide'
        )
      ).toBeCloseTo(Math.PI / 180, 12);
    });

    it('takes the sine of an angle converted that way', () => {
      expect(
        calculate(
          `<qti-math-operator name="sin">
             <qti-product>
               <qti-base-value base-type="integer">30</qti-base-value>
               <qti-base-value base-type="float">${Math.PI / 180}</qti-base-value>
             </qti-product>
           </qti-math-operator>`,
          'qti-math-operator'
        )
      ).toBeCloseTo(0.5, 12);
    });

    it('compares the result to significant figures', () => {
      const equalRounded = (a: string, b: string) =>
        calculate(
          `<qti-equal-rounded rounding-mode="significantFigures" figures="3">
             <qti-base-value base-type="float">${a}</qti-base-value>
             <qti-base-value base-type="float">${b}</qti-base-value>
           </qti-equal-rounded>`,
          'qti-equal-rounded'
        );

      expect(equalRounded('0.5', '0.5001')).toBe(true);
      expect(equalRounded('0.5', '0.51')).toBe(false);
    });
  });

  describe('a mean scaled, rounded and scaled back', () => {
    // mean([1,2,4]) is 2.333…; x100 rounds to 233; /100 is 2.33.
    it('rounds a mean to two decimal places the long way', () => {
      expect(
        calculate(
          `<qti-divide>
             <qti-round>
               <qti-product>
                 <qti-stats-operator name="mean">
                   <qti-ordered>
                     <qti-base-value base-type="integer">1</qti-base-value>
                     <qti-base-value base-type="integer">2</qti-base-value>
                     <qti-base-value base-type="integer">4</qti-base-value>
                   </qti-ordered>
                 </qti-stats-operator>
                 <qti-base-value base-type="integer">100</qti-base-value>
               </qti-product>
             </qti-round>
             <qti-base-value base-type="integer">100</qti-base-value>
           </qti-divide>`,
          'qti-divide'
        )
      ).toBeCloseTo(2.33, 12);
    });
  });

  describe('a division converted back to an integer', () => {
    // qti-divide is a float however it divides, so the round is what makes
    // this assignable to an integer variable.
    it('rounds 15 / 2 to 8', () => {
      expect(
        calculate(
          `<qti-round>
             <qti-divide>
               <qti-product>
                 <qti-base-value base-type="integer">3</qti-base-value>
                 <qti-base-value base-type="integer">5</qti-base-value>
               </qti-product>
               <qti-base-value base-type="integer">2</qti-base-value>
             </qti-divide>
           </qti-round>`,
          'qti-round'
        )
      ).toBe(8);
    });

    it('declares its result an integer, where the division declares a float', () => {
      container.innerHTML = `<qti-round><qti-divide></qti-divide></qti-round>`;
      const round = container.querySelector('qti-round') as HTMLElement & { resultBaseType?: string };
      const divide = container.querySelector('qti-divide') as HTMLElement & { resultBaseType?: string };

      expect(round.resultBaseType).toBe('integer');
      expect(divide.resultBaseType).toBe('float');
    });
  });
});
