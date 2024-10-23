import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';

import { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';
import { ItemContext, itemContext } from '../../../qti-assessment-item/qti-assessment-item.context';

export class QtiPrintedVariable extends LitElement {
  @property({ type: String })
  identifier: string;

  @consume({ context: itemContext, subscribe: true })
  @state()
  public itemContext?: ItemContext;

  override render() {
    const value = this.itemContext?.variables.find(v => v.identifier === this.identifier)?.value;
    return html`${JSON.stringify(value, null, 2)}`;
  }

  public calculate(): Readonly<string | string[]> {
    const assessmentItem = this.closest('qti-assessment-item') as QtiAssessmentItem;
    const identifier = this.identifier;
    const result = assessmentItem.getVariable(identifier).value;
    return result;
  }
}

customElements.define('qti-printed-variable', QtiPrintedVariable);
