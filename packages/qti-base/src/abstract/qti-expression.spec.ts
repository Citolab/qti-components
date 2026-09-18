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
});
