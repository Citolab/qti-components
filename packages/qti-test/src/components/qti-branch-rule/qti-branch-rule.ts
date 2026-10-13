import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { evaluateBooleanChild } from '../../internal/evaluate-condition';

import type { Condition } from '../../internal/evaluate-condition';

/**
 * @summary The qti-branch-rule element jumps the test forward to `target` when its expression is true.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.branch-rule
 *
 * A child of `qti-test-part`, `qti-assessment-section` or `qti-assessment-item-ref`. It is
 * evaluated after the parent has been presented; the first rule whose expression is true wins.
 * Branch rules only apply in linear navigation mode. An expression that cannot be evaluated does
 * not branch.
 *
 * @attr {string} target - Required. The identifier of an item ref, section or test part ahead of
 *   the parent, or one of the reserved targets `EXIT_SECTION`, `EXIT_TESTPART`, `EXIT_TEST`.
 *
 * @slot - The boolean expression.
 */
export class QtiBranchRule extends LitElement implements Condition {
  static readonly EXIT_SECTION = 'EXIT_SECTION';
  static readonly EXIT_TESTPART = 'EXIT_TESTPART';
  static readonly EXIT_TEST = 'EXIT_TEST';

  static override styles = css`
    :host {
      display: none;
    }
  `;

  @property({ type: String }) target = '';

  /** `true` when the test should jump to `target`. */
  public evaluate(): boolean {
    return evaluateBooleanChild(this, false);
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-branch-rule': QtiBranchRule;
  }
}
