import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ItemContext, itemContext } from 'src/lib/qti-components/qti-assessment-item/qti-assessment-item.context';
import { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';

export class QtPrintedVariable extends LitElement {
  @property({ type: String })
  identifier: string;

  @consume({ context: itemContext, subscribe: true })
  @state()
  public itemContext?: ItemContext;

  override render() {
    const value = this.itemContext?.variables.find(v => v.identifier === this.identifier)?.value;
    return html`${JSON.stringify(value, null, 2)}`;
  }

  // constructor() {
  //   super();
  //   const assessmentItem = this.closest('qti-assessment-item') as QtiAssessmentItem;
  //   assessmentItem.addEventListener('qti-response-processed', () => {
  //     this.value = this.calculate() as string;
  //   });
  // }

  // public connectedCallback(): void {
  //   super.connectedCallback();
  //   this.value = this.calculate() as string;
  // }

  public calculate(): Readonly<string | string[]> {
    const assessmentItem = this.closest('qti-assessment-item') as QtiAssessmentItem;
    const identifier = this.identifier;
    const result = assessmentItem.getVariable(identifier).value;
    return result;
  }
}

customElements.define('qti-printed-variable', QtPrintedVariable);
