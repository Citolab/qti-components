import '@citolab/qti-components';

import { html, render } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { QtiExpression } from './qti-expression';

describe('QtiExpression', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => testContainer.remove());

  /**
   * `lastResult` is the supported way for a tool to inspect a scoring run:
   * process, then walk the rule tree reading the value off each expression. It
   * replaces the debug `<pre>` these elements used to render, which nobody
   * could see and which cost a JSON.stringify per render.
   */
  describe('lastResult', () => {
    it('is undefined before the expression has been calculated', () => {
      render(
        html`<qti-sum>
          <qti-base-value base-type="float">1</qti-base-value>
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-sum>`,
        testContainer
      );
      expect((testContainer.querySelector('qti-sum') as QtiExpression<number>).lastResult).toBeUndefined();
    });

    it('holds what the last calculate produced', () => {
      render(
        html`<qti-sum>
          <qti-base-value base-type="float">1</qti-base-value>
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-sum>`,
        testContainer
      );
      const sum = testContainer.querySelector('qti-sum') as QtiExpression<number>;
      sum.calculate();
      expect(sum.lastResult).toBe(3);
    });

    it('annotates every expression of a tree after the outer one runs', () => {
      render(
        html`<qti-sum>
          <qti-product>
            <qti-base-value base-type="float">2</qti-base-value>
            <qti-base-value base-type="float">3</qti-base-value>
          </qti-product>
          <qti-base-value base-type="float">4</qti-base-value>
        </qti-sum>`,
        testContainer
      );
      const sum = testContainer.querySelector('qti-sum') as QtiExpression<number>;
      sum.calculate();

      expect(sum.lastResult).toBe(10);
      // The nested expression carries its own value, so a visualiser can read
      // the whole tree from one run.
      expect((testContainer.querySelector('qti-product') as QtiExpression<number>).lastResult).toBe(6);
    });
  });

  it('renders once and not again, so a scoring run costs no re-renders', async () => {
    render(
      html`<qti-sum>
        <qti-base-value base-type="float">1</qti-base-value>
        <qti-base-value base-type="float">2</qti-base-value>
      </qti-sum>`,
      testContainer
    );
    const sum = testContainer.querySelector('qti-sum') as QtiExpression<number> & {
      render: () => unknown;
      updateComplete: Promise<boolean>;
    };
    await sum.updateComplete;

    let renders = 0;
    const original = sum.render.bind(sum);
    sum.render = () => {
      renders++;
      return original();
    };

    for (let i = 0; i < 10; i++) {
      sum.calculate();
      sum.requestUpdate();
      await sum.updateComplete;
    }

    expect(renders).toBe(0);
  });
  /**
   * Elements reached through `getVariables` that declare no base type used to
   * be labelled `integer` wholesale. `compareSingleValues` parses an integer
   * with `parseInt`, so every non-integer result was silently truncated before
   * it was compared.
   */
  describe('base type of an undeclared result', () => {
    const calc = (markup: string, selector: string) => {
      testContainer.innerHTML = markup;
      return (testContainer.querySelector(selector) as QtiExpression<unknown>).calculate();
    };

    it('does not treat two different floats as equal', () => {
      // divide(5,2) is 2.5; truncated to an integer it compared 2 against 2.
      expect(
        calc(
          `<qti-equal>
             <qti-divide>
               <qti-base-value base-type="float">5</qti-base-value>
               <qti-base-value base-type="float">2</qti-base-value>
             </qti-divide>
             <qti-base-value base-type="float">2.4</qti-base-value>
           </qti-equal>`,
          'qti-equal'
        )
      ).toBe(false);
    });

    it('still matches a float against its own value', () => {
      expect(
        calc(
          `<qti-equal>
             <qti-divide>
               <qti-base-value base-type="float">5</qti-base-value>
               <qti-base-value base-type="float">2</qti-base-value>
             </qti-divide>
             <qti-base-value base-type="float">2.5</qti-base-value>
           </qti-equal>`,
          'qti-equal'
        )
      ).toBe(true);
    });

    it('keeps integers comparing as integers', () => {
      expect(
        calc(
          `<qti-equal>
             <qti-sum>
               <qti-base-value base-type="integer">2</qti-base-value>
               <qti-base-value base-type="integer">3</qti-base-value>
             </qti-sum>
             <qti-base-value base-type="integer">5</qti-base-value>
           </qti-equal>`,
          'qti-equal'
        )
      ).toBe(true);
    });

    it('reports an expression that evaluated to NULL as a NULL value, not a missing operand', () => {
      expect(calc('<qti-is-null><qti-null></qti-null></qti-is-null>', 'qti-is-null')).toBe(true);
    });
  });

  describe('qti-correct with an unresolvable identifier', () => {
    it('is NULL rather than taking down the processing run', () => {
      testContainer.innerHTML = `
        <qti-assessment-item identifier="I">
          <qti-is-null>
            <qti-correct identifier="NOT_DECLARED"></qti-correct>
          </qti-is-null>
        </qti-assessment-item>`;
      const isNull = testContainer.querySelector('qti-is-null') as QtiExpression<boolean>;

      expect(() => isNull.calculate()).not.toThrow();
      expect(isNull.calculate()).toBe(true);
    });
  });
});
