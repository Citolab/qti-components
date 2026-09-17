import { LitElement } from 'lit';

/**
 * Interface for any object that can process QTI rules
 */
export interface QtiRuleBase {
  process(): any;
}

/**
 * Abstract base class for QTI rule DOM elements
 */
export abstract class QtiRuleElement extends LitElement implements QtiRuleBase {
  abstract process(): any;
}

/**
 * Thrown by `qti-exit-response` to end the response processing of an attempt.
 *
 * An exit can sit at any depth — inside a `qti-response-condition` branch, or
 * inside a `qti-response-processing-fragment` — and has to stop every rule
 * after it, not just its own siblings. Unwinding the stack is what reaches
 * every one of those loops without each of them having to report upwards.
 *
 * `qti-response-processing` catches it at the top of the run. The outcomes set
 * before the exit are kept, because each `qti-set-outcome-value` has already
 * dispatched by the time this is thrown.
 */
export class QtiExitResponseSignal extends Error {
  constructor() {
    super('qti-exit-response');
    this.name = 'QtiExitResponseSignal';
  }
}
