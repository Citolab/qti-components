import { property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { convertNumberToUniversalFormat } from '@qti-components/base';
import { itemContext } from '@qti-components/base';

import { QtiRule } from '../qti-rule/qti-rule';

import type { QtiExpression } from '@qti-components/base';
import type { InterpolationTableEntry, OutcomeVariable } from '@qti-components/base';
import type { ItemContext } from '@qti-components/base';

/**
 * The lookupOutcomeValue rule sets the value of an outcome variable to the value obtained
 * by looking up the value of the associated expression in the lookupTable associated
 * with the outcome's declaration.
 */
export class QtiLookupOutcomeValue extends QtiRule {
  @property({ type: String }) identifier: string;

  @consume({ context: itemContext, subscribe: true })
  @state()
  protected context?: ItemContext;

  get childExpression(): QtiExpression<string> {
    return this.firstElementChild as QtiExpression<string>;
  }

  public override process(): number | string | null {
    const identifier = this.getAttribute('identifier');

    const outcomeVariable: OutcomeVariable | null =
      this.context?.variables.find(v => v.identifier === identifier) || null;

    if (!outcomeVariable) {
      console.warn(`lookupOutcomeValue: no outcome declaration for "${identifier}"`);
      return null;
    }

    const sourceValue = parseFloat(this.childExpression.calculate());

    // A declaration carries one table or the other. The match table is checked
    // first because its targets need no numeric interpretation.
    let value: number | string | undefined;
    if (outcomeVariable.matchTable?.size) {
      value = outcomeVariable.matchTable.get(sourceValue);
    } else if (outcomeVariable.interpolationTable) {
      value = this.#interpolate(sourceValue, outcomeVariable.interpolationTable);
    }

    if (value === null || value === undefined) {
      // Nothing matched, so there is no value to write. The outcome keeps the
      // default its declaration gave it rather than being overwritten with a
      // score the table never specified.
      console.warn(`lookupOutcomeValue: no table entry matches ${sourceValue} for "${identifier}"`);
      return null;
    }
    this.dispatchEvent(
      new CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>('qti-set-outcome-value', {
        bubbles: true,
        composed: true,
        detail: {
          outcomeIdentifier: this.identifier,
          value: convertNumberToUniversalFormat(value)
        }
      })
    );
    return value;
  }

  /**
   * An interpolation table entry's `source-value` is the *lower bound* of a
   * range, not a value to match exactly, and the entries are tested in document
   * order — the first whose bound the source value clears wins. Tables are
   * therefore authored from the highest bound down.
   */
  #interpolate(sourceValue: number, entries: InterpolationTableEntry[]): number | undefined {
    if (Number.isNaN(sourceValue)) return undefined;

    return entries.find(entry =>
      entry.includeBoundary ? sourceValue >= entry.sourceValue : sourceValue > entry.sourceValue
    )?.targetValue;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-lookup-outcome-value': QtiLookupOutcomeValue;
  }
}
