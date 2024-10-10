import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Calculate } from '../internal/expression-result';
import { ResponseVariable } from '../internal/variables';
import { ItemContext, itemContext } from '../qti-assessment-item/qti-assessment-item.context';

/**
 * https://www.imsglobal.org/spec/qti/v3p0/impl#h.fi29q8dubjgw
 * <qti-custom-operator class="js.org">
        <qti-base-value base-type="string"><![CDATA[
          console.log(context.variables);
          return 'B'
          document.querySelector('qti-end-attempt-interaction').disabled = true;
          ]]></qti-base-value>
      </qti-custom-operator>
    </qti-set-outcome-value>
 */
@customElement('qti-custom-operator')
export class QtiCustomOperator extends LitElement implements Calculate {
  private operatorFunction: Function;

  @consume({ context: itemContext, subscribe: true })
  @state()
  private _context?: ItemContext;

  render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  handleSlotChange(event: Event) {
    // expecting <[!CDATA[ ... ]]> is converted into <!-- ... --> with qti-transform: cDataToComment
    const commentNode = Array.from(this.firstElementChild?.childNodes ?? []).find(
      node => node.nodeType === Node.COMMENT_NODE
    );
    try {
      this.operatorFunction = new Function('context', 'fn', 'item', commentNode.textContent ?? '');
    } catch (e) {
      console.error('custom-operator contains invalid javascript code', e);
    }
  }

  public calculate() {
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

    return this.operatorFunction(this._context, fn, item);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-custom-operator': QtiCustomOperator;
  }
}
