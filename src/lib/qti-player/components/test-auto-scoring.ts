/* eslint-disable lit-a11y/click-events-have-key-events */

import { OutcomeVariable } from '@citolab/qti-components/qti-components';
import { consume } from '@lit/context';
import { css, html, LitElement, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '../../qti-test';

@customElement('test-auto-scoring')
export class TestAutoScoring extends LitElement {
  static styles = css`
    :host {
      display: flex;
      user-select: none;
    }
  `;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  render() {
    if (this._sessionContext.view !== 'scorer') return html``;
    const { items } = this._testContext;
    const item = items.find(item => item.identifier === this._sessionContext.identifier);
    const scoreOutcome = item.variables.find(vr => vr.identifier == 'SCORE') as OutcomeVariable;
    const externalScored = scoreOutcome?.externalScored;

    return html`
      <slot></slot>
      ${item.category !== 'dep-informational'
        ? html` <test-scoring-buttons
            .view=${'scorer'}
            .disabled=${externalScored === 'externalMachine' || externalScored === null}
          ></test-scoring-buttons>`
        : nothing}
      ${item.category !== 'dep-informational' ? html`<score-info></score-info>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-auto-scoring': TestAutoScoring;
  }
}
