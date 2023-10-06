import { consume } from '@lit-labs/context';
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { itemContext, ItemContext } from '../qti-assessment-item/qti-assessment-item.context';
import { QtiMatch } from '../qti-responseprocessing';
import { Calculate } from '../qti-utilities/ExpressionResult';

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
  @property({ attribute: false })
  public context?: ItemContext;

  render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  handleSlotChange(event: Event) {
    const scriptString = this.firstElementChild?.firstChild?.textContent?.trim();
    try {
      const output = scriptString.replace('[CDATA[', '').replace(']]', '').trim();
      this.operatorFunction = new Function('context', 'fn', 'item', output ?? '');
    } catch (e) {
      console.error('custom-operator contains invalid javascript code', e);
    }
  }

  public calculate() {
    const fn = {
      match: QtiMatch.match,
      var: (responseIdentifier: string) =>
        this.context?.variables.find(v => v.identifier === responseIdentifier)?.value ?? ''
    };
    const item = {
      getVariable: (variableIdentifier: string) =>
        this.context?.variables.find(v => v.identifier === variableIdentifier),
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
      }
    };
    return this.operatorFunction(this.context, fn, item);
  }
}
