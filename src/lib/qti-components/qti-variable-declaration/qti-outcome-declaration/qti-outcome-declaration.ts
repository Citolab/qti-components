import { consume } from '@lit/context';
import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { BaseType, Cardinality } from '../../internal/expression-result';
import type { OutcomeVariable } from '../../internal/variables';
import { itemContext } from '../../qti-assessment-item/qti-assessment-item.context';
import { QtiVariableDeclaration } from '../qti-variable-declaration';
import type { ItemContext } from '../../internal/item.context';

@customElement('qti-outcome-declaration')
export class QtiOutcomeDeclaration extends QtiVariableDeclaration {
  @property({ type: String, attribute: 'base-type' }) baseType: BaseType;
  @property({ type: String, attribute: 'external-scored' }) externalScored: 'human' | 'externalMachine' | null = null;
  @property({ type: String }) identifier: string;
  @property({ type: String }) cardinality: Cardinality;

  @consume({ context: itemContext, subscribe: true })
  @state()
  public itemContext?: ItemContext;

  static styles = [
    css`
      :host {
        display: none;
      }
    `
  ];

  override render() {
    const value = this.itemContext?.variables.find(v => v.identifier === this.identifier)?.value;
    return html`${JSON.stringify(value, null, 2)}`;
  }

  get interpolationTable(): Map<number, number> | null {
    const table = this.querySelector('qti-interpolation-table');
    if (table) {
      const entries = new Map<number, number>();
      for (const entry of table.querySelectorAll('qti-interpolation-table-entry')) {
        if (!entry.getAttribute('source-value') && entry.getAttribute('target-value')) {
          console.error('source-value or target-value is missing in qti-interpolation-table-entry');
        }
        const sourceValue = parseInt(entry.getAttribute('source-value'));
        const targetValue = parseInt(entry.getAttribute('target-value'));
        if (isNaN(sourceValue) || isNaN(targetValue)) {
          console.error('source-value or target-value is not a number in qti-interpolation-table-entry');
        }
        entries.set(sourceValue, targetValue);
      }
      return entries;
    }
    return null;
  }

  public override connectedCallback() {
    super.connectedCallback();
    const outcomeVariable: OutcomeVariable = {
      identifier: this.identifier,
      cardinality: this.cardinality,
      baseType: this.baseType,
      type: 'outcome',
      value: null,
      interpolationTable: this.interpolationTable,
      externalScored: this.externalScored
    };
    outcomeVariable.value = this.defaultValues(outcomeVariable);
    this.dispatchEvent(
      new CustomEvent('qti-register-variable', {
        bubbles: true,
        composed: true,
        detail: { variable: outcomeVariable }
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-outcome-declaration': QtiOutcomeDeclaration;
  }
}
