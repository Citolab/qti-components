import { consume } from '@lit/context';
import { css, html } from 'lit';
import { property, state } from 'lit/decorators.js';

import { sessionContext, testContext } from '@qti-components/base';
import { QtiModalFeedback } from '@qti-components/elements/elements';

import type { PropertyValues } from 'lit';
import type { SessionContext, TestContext } from '@qti-components/base';

export type TestFeedbackAccess = 'atEnd' | 'during';

export type QtiTestFeedbackAvailabilityChangedEvent = CustomEvent<{
  identifier: string;
  partId: string | null;
  available: boolean;
}>;

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
   *   feedback sits in. Becoming available only unlocks a test-show-feedback
   *   button — the feedback itself stays hidden until the candidate navigates
   *   to it.
   * - `during` — while the test is still in progress, after each instance of
   *   outcome processing. Shows the instant its outcome matches.
   */
  @property({ type: String, attribute: 'access' })
  public access: TestFeedbackAccess = 'atEnd';

  @consume({ context: testContext, subscribe: true })
  @state()
  private _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  @state()
  private _sessionContext?: SessionContext;

  /**
   * For `access="atEnd"`: whether the feedback's outcome has matched and it is
   * ready to be shown. While available, the feedback stays hidden until a
   * test-show-feedback button navigates the candidate to it
   * (`_sessionContext.navFeedbackIdentifier`). `during` feedback ignores this
   * flag and shows the instant its outcome matches.
   */
  @state()
  private _available = false;

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
    const shown = (matched && this.showHide === 'show') || (!matched && this.showHide === 'hide');

    if (this.access === 'during') {
      this.showStatus = shown ? 'on' : 'off';
      return;
    }

    // atEnd: becoming available only unlocks the button; willUpdate derives the
    // actual showStatus from navigation.
    this.#setAvailable(shown);
  }

  /**
   * Derive atEnd visibility from navigation, and withdraw availability once the
   * candidate leaves this feedback's own part. Runs on every context tick —
   * sessionContext changes on every navigation — so it needs no manual
   * invocation the way checkShowFeedback's outcome re-evaluation does.
   */
  protected override willUpdate(_changedProperties: PropertyValues): void {
    if (this.access !== 'atEnd') return;

    const ownPartId = this.#ownPartId;
    const activePartId = this._sessionContext?.navPartId ?? null;

    // A part-scoped feedback is the candidate's "end of part" screen; once they
    // move into another part it should disappear and stop being offered.
    if (ownPartId && activePartId && activePartId !== ownPartId) {
      this.#setAvailable(false);
      this.showStatus = 'off';
      return;
    }

    const navTarget = this._sessionContext?.navFeedbackIdentifier ?? null;
    this.showStatus = this._available && navTarget === this.identifier ? 'on' : 'off';
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

  /** Update availability and announce the change so test-show-feedback can enable. */
  #setAvailable(available: boolean): void {
    if (this._available === available) return;
    this._available = available;
    this.dispatchEvent(
      new CustomEvent('qti-test-feedback-availability-changed', {
        detail: { identifier: this.identifier, partId: this.#ownPartId, available },
        bubbles: true,
        composed: true
      })
    );
  }

  override render() {
    return html`<div ?hidden=${this.showStatus !== 'on'}><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-test-feedback': QtiTestFeedback;
  }
  interface GlobalEventHandlersEventMap {
    'qti-test-feedback-availability-changed': QtiTestFeedbackAvailabilityChangedEvent;
  }
}
