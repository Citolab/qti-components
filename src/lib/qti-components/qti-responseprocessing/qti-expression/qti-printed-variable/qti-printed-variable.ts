import { LitElement, PropertyValueMap, html } from 'lit';
import { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';
import { property, state } from 'lit/decorators.js';

export class QtPrintedVariable extends LitElement {
  @property({ type: String })
  identifier: string;

  @state()
  value: string | string[] | number = '';

  override render() {
    return html`${Array.isArray(this.value) ? this.value.map(val => html`${val}`) : this.value}`;
  }

  constructor() {
    super();
    const assessmentItem = this.closest('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.addEventListener('qti-response-processing', () => {
      this.value = this.calculate() as string;
    });
  }

  // protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
  //   super.firstUpdated(_changedProperties);
  //   this.value = this.calculate() as string;
  // }

  public calculate(): string | string[] | number {
    const assessmentItem = this.closest('qti-assessment-item') as QtiAssessmentItem;
    const identifier = this.identifier;
    const result = assessmentItem.getVariable(identifier).value;
    return result;
  }
}

customElements.define('qti-printed-variable', QtPrintedVariable);
