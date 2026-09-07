import { consume } from '@lit/context';
import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

import { itemContext } from '@qti-components/base';

import { applyFormat, toExponential } from './printed-variable-format';

import type { BaseType } from '@qti-components/base';
import type { VariableDeclaration } from '@qti-components/base';
import type { ItemContext } from '@qti-components/base';

/**
 * @summary Prints the value of an item variable into the item body.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#printedVariable
 *
 * A container variable is printed as its values joined by `delimiter`; a record as
 * `name<mapping-indicator>value` pairs joined by the same delimiter. A NULL variable — absent,
 * null, or an empty container — prints nothing at all.
 *
 * @attr {string} identifier - Required. Identifier of the variable to print.
 * @attr {string} [format] - printf-style conversion string, e.g. `%.2f` or `Score: %d`. Applies
 *   to each value printed. Takes precedence over `base` and `power-form`.
 * @attr {number} [base=10] - Number base used when printing an integer variable.
 * @attr {number} [index] - 1-based index selecting a single value of an ordered variable.
 * @attr {boolean} [power-form=false] - Print numeric values in exponential form.
 * @attr {string} [field] - Field of a record variable to print, instead of the whole record.
 * @attr {string} [delimiter=;] - Separator between the values of an ordered/multiple/record variable.
 * @attr {string} [mapping-indicator==] - Separator between a record field's name and its value.
 */
export class QtiPrintedVariable extends LitElement {
  @property({ type: String })
  identifier: string;

  @property({ type: String })
  format?: string;

  @property({ type: Number })
  base = 10;

  @property({ type: Number })
  index?: number;

  @property({ type: Boolean, attribute: 'power-form' })
  powerForm = false;

  @property({ type: String })
  field?: string;

  @property({ type: String })
  delimiter = ';';

  @property({ type: String, attribute: 'mapping-indicator' })
  mappingIndicator = '=';

  @consume({ context: itemContext, subscribe: true })
  @state()
  protected context?: ItemContext;

  override render() {
    const variable = this.context?.variables.find(v => v.identifier === this.identifier);
    const printed = variable ? this.#print(variable) : null;
    return printed === null ? nothing : html`${printed}`;
  }

  /** Returns `null` for anything QTI treats as NULL, which prints as nothing. */
  #print(variable: VariableDeclaration<unknown>): string | null {
    const value = variable.value;
    if (value === null || value === undefined) return null;

    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      if (this.index !== undefined) {
        const selected = value[this.index - 1];
        return selected === null || selected === undefined ? null : this.#printValue(selected, variable.baseType);
      }
      return value.map(entry => this.#printValue(entry, variable.baseType)).join(this.delimiter);
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      if (this.field !== undefined) {
        const selected = record[this.field];
        return selected === null || selected === undefined ? null : this.#printValue(selected, variable.baseType);
      }
      const fields = Object.entries(record).filter(([, entry]) => entry !== null && entry !== undefined);
      if (fields.length === 0) return null;
      return fields
        .map(([name, entry]) => `${name}${this.mappingIndicator}${this.#printValue(entry, variable.baseType)}`)
        .join(this.delimiter);
    }

    return this.#printValue(value, variable.baseType);
  }

  #printValue(value: unknown, baseType?: BaseType): string {
    // A pair/directedPair arrives as its two identifiers; QTI writes them space separated.
    const raw = Array.isArray(value) ? value.join(' ') : String(value);

    if (this.format) return applyFormat(this.format, raw);

    if (baseType === 'integer' && this.base !== 10) {
      const integer = Number.parseInt(raw, 10);
      if (Number.isFinite(integer)) return integer.toString(this.base);
    }

    if (this.powerForm) {
      const numeric = Number(raw);
      if (raw.trim() !== '' && Number.isFinite(numeric)) return toExponential(numeric);
    }

    return raw;
  }

  public calculate(): VariableDeclaration<string | string[]> {
    const result = this.context.variables.find(v => v.identifier === this.identifier) || null;
    return result;
  }
}
