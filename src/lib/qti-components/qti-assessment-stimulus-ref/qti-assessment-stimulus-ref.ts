import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { qtiTransformItem } from '../../qti-transformers';

@customElement('qti-assessment-stimulus-ref')
export class QtiAssessmentStimulusRef extends LitElement {
  @property({ type: String }) identifier = '';
  @property({ type: String }) href = '';

  public async connectedCallback(): Promise<void> {
    super.connectedCallback();

    const event = new Event('qti-assessment-stimulus-ref-connected', { cancelable: true, bubbles: true });
    const isPrevented = this.dispatchEvent(event);

    if (isPrevented) {
      const item = this.closest('qti-assessment-item');

      const stimulusRef = item.querySelector(`[data-stimulus-idref=${this.identifier}]`);
      if (stimulusRef) {
        await this.loadAndAppendStimulus(stimulusRef);
      } else {
        console.warn(`Stimulus with data-stimulus-idref ${this.identifier} not found`);
      }
    }
  }

  public async loadAndAppendStimulus(stimulusRef: Element) {
    const path = this.href.substring(0, this.href.lastIndexOf('/'));
    const stimulus = await qtiTransformItem()
      .load(this.href)
      .then(api => api.path(path).htmldoc());
    if (stimulus) {
      const elements = stimulus.querySelectorAll('qti-stimulus-body, qti-stylesheet');
      stimulusRef.append(...elements);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-stimulus-ref': QtiAssessmentStimulusRef;
  }
}
