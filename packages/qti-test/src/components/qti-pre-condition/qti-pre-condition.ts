import { css, html, LitElement } from 'lit';

import { evaluateBooleanChild } from '../../internal/evaluate-condition';

import type { Condition } from '../../internal/evaluate-condition';

/**
 * @summary The qti-pre-condition element holds one boolean expression that decides whether its parent is presented.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.pre-condition
 *
 * A child of `qti-test-part`, `qti-assessment-section` or `qti-assessment-item-ref`. When the test
 * is about to present the parent and the expression is false (or NULL), the parent is skipped.
 * Pre-conditions only apply in linear navigation mode; in nonlinear mode they are ignored.
 *
 * Evaluation is pull-based, like every expression: the test calls `evaluate()` when it needs the
 * answer. An expression that cannot be evaluated fails open, so the parent is shown.
 *
 * @slot - The boolean expression.
 */
export class QtiPreCondition extends LitElement implements Condition {
  static override styles = css`
    :host {
      display: none;
    }
  `;

  /** `true` when the parent may be presented. */
  public evaluate(): boolean {
    return evaluateBooleanChild(this, true);
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-pre-condition': QtiPreCondition;
  }
}
