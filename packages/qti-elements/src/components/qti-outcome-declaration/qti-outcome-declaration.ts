import { consume } from '@lit/context';
import { css, html } from 'lit';
import { property, state } from 'lit/decorators.js';

import { itemContext } from '@qti-components/base';
import { QtiVariableDeclaration } from '@qti-components/base';

import type { BaseType, Cardinality } from '@qti-components/base';
import type { OutcomeVariable } from '@qti-components/base';
import type { ItemContext } from '@qti-components/base';

export class QtiOutcomeDeclaration extends QtiVariableDeclaration {
  @property({ type: String, attribute: 'base-type' }) baseType: BaseType;
  @property({ type: String, attribute: 'external-scored' }) externalScored: 'human' | 'externalMachine' | null = null;
  @property({ type: String }) identifier: string;
  @property({ type: String }) cardinality: Cardinality;

  @consume({ context: itemContext, subscribe: true })
  @state()
  public itemContext?: ItemContext;

  static override styles = [
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
        const sourceValue = parseFloat(entry.getAttribute('source-value'));
        const targetValue = parseFloat(entry.getAttribute('target-value'));
        if (isNaN(sourceValue) || isNaN(targetValue)) {
          console.error('source-value or target-value is not a number in qti-interpolation-table-entry');
        }
        entries.set(sourceValue, targetValue);
      }
      return entries;
    }
    return null;
  }

  /**
   * A qti-match-table maps a source value onto a target exactly, with no
   * boundaries and no interpolation. Targets keep their authored spelling
   * because a match table is not restricted to numeric outcomes.
   */
  get matchTable(): Map<number, string> | null {
    const table = this.querySelector('qti-match-table');
    if (!table) return null;

    const entries = new Map<number, string>();
    for (const entry of table.querySelectorAll('qti-match-table-entry')) {
      const sourceValue = parseFloat(entry.getAttribute('source-value'));
      const targetValue = entry.getAttribute('target-value');
      if (Number.isNaN(sourceValue) || targetValue === null) {
        console.error('source-value or target-value is missing or invalid in qti-match-table-entry');
        continue;
      }
      entries.set(sourceValue, targetValue);
    }
    return entries;
  }

  public override connectedCallback() {
    super.connectedCallback();

    const defaultValue = this.defaultValues(this.cardinality);

    const outcomeVariable: OutcomeVariable = {
      identifier: this.identifier,
      cardinality: this.cardinality,
      baseType: this.baseType,
      defaultValue: defaultValue,
      type: 'outcome',
      value: null,
      interpolationTable: this.interpolationTable,
      matchTable: this.matchTable,
      externalScored: this.externalScored
    };
    // At runtime, outcome variables are instantiated as part of an item session.
    // Their values may be initialized with a default value and/or set during response processing.
    // If no default value is given in the declaration then the outcome variable is initialized to NULL unless the outcome is of a numeric type (integer or float) in which case it is initialized to 0.
    outcomeVariable.value = defaultValue;
    if (
      (outcomeVariable.value === null || outcomeVariable.value == undefined) &&
      (outcomeVariable.baseType === 'integer' || outcomeVariable.baseType === 'float')
    ) {
      outcomeVariable.value = '0';
    }
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
