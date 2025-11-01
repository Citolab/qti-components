import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { QtiRule } from '../../qti-response-processing';
import type { QtiTemplateConstraint } from '../qti-template-contraint/qti-template-constraint';
import type { PropertyValueMap } from 'lit';

/**
 * @summary The qti-template-processing element contains template processing rules.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.template-processing
 */
@customElement('qti-template-processing')
export class QtiTemplateProcessing extends LitElement {
  static styles = [
    css`
      :host {
        display: none;
      }
    `
  ];

  private _maxIterations = 100; // Prevent infinite loops in template constraints

  override render() {
    return html`<slot></slot>`;
  }

  /**
   * Process template rules to set template variable values
   */
  public process(): void {
    const assessmentItem = this.closest('qti-assessment-item');
    if (!assessmentItem) {
      console.warn('qti-template-processing must be inside qti-assessment-item');
      return;
    }

    let iterations = 0;
    let shouldReprocess = false;

    do {
      shouldReprocess = false;
      iterations++;

      if (iterations > this._maxIterations) {
        console.error('Template processing exceeded maximum iterations. Possible infinite loop.');
        break;
      }

      try {
        const rules = [...this.children] as QtiRule[];
        for (const rule of rules) {
          // Check if this is a template constraint that failed
          if (rule.tagName.toLowerCase() === 'qti-template-constraint') {
            const constraintResult = (rule as QtiTemplateConstraint).calculate();
            if (constraintResult === false) {
              // Template constraint failed, restart processing
              shouldReprocess = true;
              break;
            }
          } else {
            rule.process();
          }
        }
      } catch (error) {
        console.error('Error during template processing:', error);
        break;
      }
    } while (shouldReprocess);

    // Dispatch event that template processing is complete
    this.dispatchEvent(
      new CustomEvent('qti-template-processing-complete', {
        bubbles: true,
        composed: true,
        detail: { iterations }
      })
    );
  }

  public firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    // Template processing doesn't typically use external templates like response processing
    // But we could add support for common template processing patterns here if needed
    if (this.getAttribute('template')) {
      console.info('Template processing with external template not yet implemented');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-template-processing': QtiTemplateProcessing;
  }
}
