import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import * as styles from './styles';
import { TestComponent } from './test-component.abstract';

import type { QtiAssessmentItemRef } from '../core';

@customElement('test-show-correct-response')
export class TestShowCorrectResponse extends TestComponent {
  static styles = css`
    :host {
      ${styles.btn};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  _processResponse() {
    const qtiItemEl = this._testElement.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${this._testContext.navItemId}"]`
    );
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    qtiAssessmentItemEl.showCorrectResponse(true);
  }

  constructor() {
    super();
    this.addEventListener('click', () => this._processResponse());
  }

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-show-correct-response': TestShowCorrectResponse;
  }
}
