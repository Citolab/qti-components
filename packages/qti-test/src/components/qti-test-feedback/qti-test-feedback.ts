import { consume } from '@lit/context';
import { css, html } from 'lit';
import { property, state } from 'lit/decorators.js';

import { testContext } from '@qti-components/base';
import { QtiModalFeedback } from '@qti-components/elements/elements';

import type { TestContext } from '@qti-components/base';

export type TestFeedbackAccess = 'atEnd' | 'during';

export class QtiTestFeedback extends QtiModalFeedback {
  static override styles = css`
    :host {
      color: gray;
    }
  `;

  /**
   * When the feedback may be presented, per the QTI 3 `access` characteristic.
   *
   * - `atEnd` — only at the conclusion of the test, or of the test part the
   *   feedback sits in.
   * - `during` — while the test is still in progress, after each instance of
   *   outcome processing.
   */
  @property({ type: String, attribute: 'access' })
  public access: TestFeedbackAccess = 'atEnd';

  @consume({ context: testContext, subscribe: true })
  @state()
  private _testContext?: TestContext;

  /**
   * Re-evaluate against the *test* context, rather than the item context the
   * inherited implementation reads.
   *
   * `qti-assessment-test` calls this after each outcome-processing run, passing
   * what that run concluded. `atEnd` feedback responds only to the run that
   * ended its own scope — the whole test for test-root feedback, or its own
   * test part for part-scoped feedback — while `during` feedback responds to
   * every run.
   */
  public override checkShowFeedback(
    outcomeIdentifier: string,
    trigger: { atEnd?: boolean; partId?: string | null } = {}
  ): void {
    if (this.outcomeIdentifier !== outcomeIdentifier) return;

    if (this.access === 'atEnd') {
      const concludedPartId = trigger.partId ?? null;
      if (trigger.atEnd !== true || concludedPartId !== this.#ownPartId) return;
    }

    const matched = this.#outcomeMatches();
    this.showStatus = (matched && this.showHide === 'show') || (!matched && this.showHide === 'hide') ? 'on' : 'off';
  }

  /** The test part this feedback belongs to, or null when it is test-root feedback. */
  get #ownPartId(): string | null {
    return this.closest('qti-test-part')?.getAttribute('identifier') ?? null;
  }

  /** Whether this feedback's test-level outcome currently names its identifier. */
  #outcomeMatches(): boolean {
    const outcomeVariable = this._testContext?.testOutcomeVariables?.find(v => v.identifier === this.outcomeIdentifier);
    if (!outcomeVariable) return false;
    return Array.isArray(outcomeVariable.value)
      ? outcomeVariable.value.includes(this.identifier)
      : !!this.identifier && outcomeVariable.value != null && this.identifier === outcomeVariable.value;
  }

  override render() {
    return html`<div ?hidden=${this.showStatus !== 'on'}><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-test-feedback': QtiTestFeedback;
  }
}
