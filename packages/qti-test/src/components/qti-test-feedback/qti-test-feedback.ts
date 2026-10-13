import { css, html } from 'lit';
import { property } from 'lit/decorators.js';

import { QtiModalFeedback } from '@qti-components/elements/elements';

/**
 * Test-level feedback. It renders nothing where it is declared: where and when it appears is up to
 * the host. After outcome processing, `qtiTest.getTestFeedback(access)` returns the ones that apply.
 */
export class QtiTestFeedback extends QtiModalFeedback {
  static override styles = css`
    :host {
      color: gray;
    }
  `;

  /** When the feedback may be shown: at the end of the test (`atEnd`), or while it runs (`during`). */
  @property({ type: String }) access: 'atEnd' | 'during' = 'atEnd';

  /**
   * Whether this feedback applies for a value of its `outcome-identifier`: with `show-hide="show"`
   * when the value is (or, for a container, holds) its `identifier`; with `hide` when it is not.
   */
  matches(value: string | readonly string[] | null | undefined): boolean {
    const found = Array.isArray(value) ? value.includes(this.identifier) : value != null && value === this.identifier;
    return this.showHide === 'hide' ? !found : found;
  }

  override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-test-feedback': QtiTestFeedback;
  }
}
