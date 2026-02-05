import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import type { TemplateVariable } from '@qti-components/base';
import type { BaseType } from '@qti-components/base';

/**
 * @summary The qti-template-declaration element declares template variables for item cloning.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.template-declaration
 */
@customElement('qti-template-declaration')
export class QtiTemplateDeclaration extends LitElement {
  @property({ type: String }) identifier: string = '';
  @property({ type: String }) cardinality: 'single' | 'multiple' | 'ordered' | 'record' = 'single';
  @property({ type: String, attribute: 'base-type' }) baseType: BaseType = 'string';
  @property({ type: Boolean, attribute: 'math-variable' }) mathVariable: boolean = false;
  @property({ type: Boolean, attribute: 'param-variable' }) paramVariable: boolean = false;

  #defaultValue: any = null;

  override render() {
    return html`<slot></slot>`;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.updateComplete.then(() => {
      this.#processDefaultValue();
      this.#registerTemplateVariable();
    });
  }

  /**
   * Process qti-default-value to extract the default value
   */
  #processDefaultValue(): void {
    const defaultValueElement = this.querySelector('qti-default-value');
    if (!defaultValueElement) {
      return;
    }

    // For now, just get the text content - this could be enhanced to handle expressions
    const textContent = defaultValueElement.textContent?.trim() || '';
    this.#defaultValue = this.#convertValue(textContent);
  }

  /**
   * Convert string value based on base-type
   */
  #convertValue(value: string): any {
    if (!value) return null;

    switch (this.baseType) {
      case 'integer':
        return parseInt(value, 10);
      case 'float':
      case 'duration':
        return parseFloat(value);
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'string':
      default:
        return value;
    }
  }

  /**
   * Register this template variable with the assessment item
   */
  #registerTemplateVariable(): void {
    const templateVariable: TemplateVariable = {
      identifier: this.identifier,
      cardinality: this.cardinality,
      baseType: this.baseType,
      defaultValue: this.#defaultValue,
      value: this.#defaultValue,
      type: 'template',
      mathVariable: this.mathVariable,
      paramVariable: this.paramVariable
    };

    // Dispatch event to register the variable

    // value must string or string[]
    const variable = { ...templateVariable, value: this.#defaultValue?.toString() || '' };
    this.dispatchEvent(
      new CustomEvent('qti-register-variable', {
        bubbles: true,
        composed: true,
        detail: { variable }
      })
    );
  }

  /**
   * Get the template variable definition
   */
  public getTemplateVariable(): TemplateVariable {
    return {
      identifier: this.identifier,
      cardinality: this.cardinality,
      baseType: this.baseType,
      value: this.#defaultValue,
      type: 'template',
      mathVariable: this.mathVariable,
      paramVariable: this.paramVariable
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-template-declaration': QtiTemplateDeclaration;
  }
}
