import { css, html } from 'lit';

import { customElement } from 'lit/decorators.js';
import type { QtiAssessmentItemRef } from '../core';
import * as styles from './styles';
import { TestComponent } from './test-component.abstract';

@customElement('test-end-attempt')
export class TestEndAttempt extends TestComponent {
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
    qtiAssessmentItemEl.processResponse();
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
    'test-end-attempt': TestEndAttempt;
  }
}
