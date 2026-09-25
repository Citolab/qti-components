import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';

import { getCustomOperator, itemContext } from '@qti-components/base';

import type { CustomOperatorValue, ResponseVariable } from '@qti-components/base';
import type { Calculate } from '@qti-components/base';
import type { ItemContext } from '@qti-components/base';

/**
 * https://www.imsglobal.org/spec/qti/v3p0/impl#h.fi29q8dubjgw
 *
 * A custom operator is outside the QTI vocabulary, so what it does is supplied
 * by the delivery engine rather than by the item. Two ways to supply it:
 *
 * `definition` names an operator the host registered with
 * `registerCustomOperator`, or one of the built-ins (`Trim`, `ToAscii`,
 * `ParseCommaDecimal` under the `depcp:`, `questify:` and `qade:` prefixes).
 * The operator is handed the calculated values of the child expressions:
 *
 * ```xml
 * <qti-custom-operator definition="depcp:Trim">
 *   <qti-variable identifier="RESPONSE"/>
 * </qti-custom-operator>
 * ```
 *
 * `class="js.org"` instead runs inline JavaScript out of a CDATA section:
 *
 * ```xml
 * <qti-custom-operator class="js.org">
 *   <qti-base-value base-type="string"><![CDATA[
 *     console.log(context.variables);
 *     return 'B'
 *   ]]></qti-base-value>
 * </qti-custom-operator>
 * ```
 *
 * `definition` is checked first; the two do not interact.
 */

export class QtiCustomOperator extends LitElement implements Calculate {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  #operatorFunction: Function;

  @consume({ context: itemContext, subscribe: true })
  @state()
  private _context?: ItemContext;

  override render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  handleSlotChange() {
    // expecting <[!CDATA[ ... ]]> is converted into <!-- ... --> with qti-transform: cDataToComment
    const commentNode = Array.from(this.firstElementChild?.childNodes ?? []).find(
      node => node.nodeType === Node.COMMENT_NODE
    );
    try {
      this.#operatorFunction = new Function('context', 'fn', 'item', commentNode?.textContent ?? '');
    } catch (e) {
      console.error('custom-operator contains invalid javascript code', e);
    }
  }

  public calculate() {
    const definition = this.getAttribute('definition');
    if (definition) {
      return this.#applyDefinedOperator(definition);
    }

    const fn = {
      variable: (responseIdentifier: string) =>
        this._context?.variables.find(v => v.identifier === responseIdentifier)?.value ?? '',
      correct: (responseIdentifier: string) =>
        (this._context?.variables.find(v => v.identifier === responseIdentifier) as ResponseVariable)
          ?.correctResponse ?? ''
    };
    const item = {
      getVariable: (variableIdentifier: string) =>
        this._context?.variables.find(v => v.identifier === variableIdentifier),
      updateOutcomeVariable: (outcomeIdentifier: string, value: string | string[]) => {
        this.dispatchEvent(
          new CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>('qti-set-outcome-value', {
            bubbles: true,
            composed: true,
            detail: {
              outcomeIdentifier,
              value
            }
          })
        );
      },
      updateResponseVariable: (responseIdentifier: string, response: string | string[]) => {
        this.dispatchEvent(
          new CustomEvent<{ responseIdentifier: string; response: string | string[] }>('qti-interaction-response', {
            bubbles: true,
            composed: true,
            detail: {
              responseIdentifier,
              response
            }
          })
        );
      }
    };

    return this.#operatorFunction(this._context, fn, item);
  }

  /**
   * An operator the host registered, or a built-in. An unknown `definition` is
   * NULL rather than an error: the item names an operator this engine does not
   * provide, which the surrounding expression can still test with
   * `qti-is-null`.
   */
  #applyDefinedOperator(definition: string) {
    const operator = getCustomOperator(definition);
    if (!operator) {
      console.warn(`qti-custom-operator: no operator registered for definition "${definition}"`);
      return null;
    }

    const values = Array.from(this.children).map(child => {
      const calculate = (child as Partial<Calculate>).calculate;
      return typeof calculate === 'function' ? (calculate.call(child) as CustomOperatorValue) : null;
    });

    return operator(values);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-custom-operator': QtiCustomOperator;
  }
}
