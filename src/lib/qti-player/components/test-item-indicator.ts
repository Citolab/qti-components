/* eslint-disable lit-a11y/click-events-have-key-events */

import { consume } from '@lit/context';
import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '../../qti-test';

@customElement('test-item-indicator')
export class TestItemIndicator extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  @property({ type: String, attribute: 'info-category' })
  private infoCategory = null;

  private _internals: ElementInternals;

  @property({ type: String, attribute: 'item-id' })
  private itemId: string = null;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  updated(changedProperties: PropertyValues<any>) {
    const { items } = this._testContext;

    if (items.length === 0) return;

    const item = items.find(item => item.identifier === this.itemId);

    const scoreOutcome = item.variables.find(vr => vr.identifier == 'SCORE');

    const score = parseInt(scoreOutcome?.value?.toString());
    const completionStatus = item.variables.find(v => v.identifier === 'completionStatus')?.value;

    if (this._sessionContext.view === 'scorer') {
      this._internals.states.delete('completed');
      if (score !== undefined && !isNaN(score)) {
        score > 0
          ? this._internals.states.add('correct') // button.classList.add('!border-sky-600');
          : this._internals.states.delete('correct');
        score === 0
          ? this._internals.states.add('incorrect') // button.classList.add(`bg-green-100`, `border-green-400`)
          : this._internals.states.delete('incorrect'); // button.classList.add(`bg-red-100`, `border-red-400`);
      } else {
        this._internals.states.delete('correct');
        this._internals.states.delete('incorrect');
      }
    }

    if (this._sessionContext.view === 'candidate') {
      this._internals.states.delete('correct');
      this._internals.states.delete('incorrect');

      completionStatus === 'completed' && item.category !== this.infoCategory
        ? this._internals.states.add('completed')
        : this._internals.states.delete('completed');
    }

    this._sessionContext.identifier === item.identifier
      ? this._internals.states.add('active') // button.classList.add('!border-sky-600');
      : this._internals.states.delete('active');

    // if (
    //   this._sessionContext.view === 'scorer' &&
    //   item.category !== this.infoCategory &&
    //   score !== undefined &&
    //   !isNaN(score)
    // ) {
    //   score > 0
    //     ? this._internals.states.add('correct') // button.classList.add('!border-sky-600');
    //     : this._internals.states.delete('correct');
    //   score === 0
    //     ? this._internals.states.add('incorrect') // button.classList.add(`bg-green-100`, `border-green-400`)
    //     : this._internals.states.delete('incorrect'); // button.classList.add(`bg-red-100`, `border-red-400`);
    // }
  }

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-item-indicator': TestItemIndicator;
  }
}
