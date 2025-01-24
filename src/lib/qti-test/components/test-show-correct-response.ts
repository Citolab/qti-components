import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';

import * as styles from './styles';
import { computedContext } from '../../exports/computed.context';
import { sessionContext } from '../../exports/session.context';

import type { ComputedContext } from '../../exports/computed.context';
import type { QtiAssessmentItem } from '../../qti-components';
import type { QtiAssessmentItemRef } from '../core';
import type { SessionContext } from '../../exports/session.context';

@customElement('test-show-correct-response')
export class TestShowCorrectResponse extends LitElement {
  static styles = css`
    :host {
      ${styles.btn};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  @consume({ context: computedContext, subscribe: true })
  private computedContext: ComputedContext;

  @consume({ context: sessionContext, subscribe: true })
  private sessionContext: SessionContext;

  _processResponse() {
    const qtiItemEl = this.computedContext.testElement.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${this.sessionContext.navItemId}"]`
    );
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem as QtiAssessmentItem;
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
