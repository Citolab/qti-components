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
