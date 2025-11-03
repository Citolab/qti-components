import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { QtiExpression } from '@qti-components/shared';
import type { QtiRule } from '@qti-components/shared';

/**
 * @summary The qti-template-constraint element is a processing rule available only in Template Processing.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.template-constraint
 *
 * It terminates Template Processing and re-runs it from the beginning if the condition
 * specified in the template constraint is not satisfied. This can be used to iterate
 * the Template Processing with different randomly-generated values until a predetermined
 * condition is satisfied.
 */
@customElement('qti-template-constraint')
export class QtiTemplateConstraint extends LitElement implements QtiRule {
  override render() {
    return html`<slot></slot>`;
  }

  /**
   * Evaluates the constraint condition
   * @returns true if constraint is satisfied, false if template processing should restart
   */
  public calculate(): boolean {
    const expressions = [...this.children] as QtiExpression<boolean>[];

    if (expressions.length !== 1) {
      console.error('qti-template-constraint must have exactly one child expression');
      return true; // Don't restart on error
    }

    try {
      const result = expressions[0].calculate();
      return Boolean(result);
    } catch (error) {
      console.error('Error evaluating template constraint:', error);
      return true; // Don't restart on error
    }
  }

  /**
   * Template constraints don't have sub-rules like conditions
   */
  public getSubRules(): QtiRule[] {
    return [];
  }

  /**
   * Process the template constraint
   * @returns true if constraint is satisfied, false if template processing should restart
   */
  public process(): boolean {
    const constraintSatisfied = this.calculate();

    if (!constraintSatisfied) {
      console.debug('Template constraint not satisfied, restarting template processing');
    }

    return constraintSatisfied;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-template-constraint': QtiTemplateConstraint;
  }
}
