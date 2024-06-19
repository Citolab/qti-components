import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { qtiTransformItem } from '../../qti-transformers';

@customElement('qti-assessment-stimulus-ref')
export class QtiAssessmentStimulusRef extends LitElement {
  @property({ type: String }) identifier = '';
  @property({ type: String }) href = '';

  public async connectedCallback(): Promise<void> {
    super.connectedCallback();

    const item = this.closest('qti-assessment-item');

    const stimulusRef = item.querySelector(`[data-stimulus-idref=${this.identifier}]`);
    if (stimulusRef) {
      const path = this.href.substring(0, this.href.lastIndexOf('/'));
      const stimulus = await qtiTransformItem()
        .load(this.href)
        .then(api => api.path(path).htmldoc());
      if (stimulus) {
        stimulusRef.appendChild(stimulus);
      }
    } else {
      console.warn(`Stimulus with data-stimulus-idref ${this.identifier} not found`);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-stimulus-ref': QtiAssessmentStimulusRef;
  }
}
