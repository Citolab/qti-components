import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { qtiTransformItem } from '../../qti-transformers';

/**
 * Represents a custom element for referencing an assessment stimulus.
 */
@customElement('qti-assessment-stimulus-ref')
export class QtiAssessmentStimulusRef extends LitElement {
  /**
   * The identifier of the stimulus.
   */
  @property({ type: String }) identifier = '';

  /**
   * The href of the stimulus.
   */
  @property({ type: String }) href = '';

  /**
   * Lifecycle method called when the element is connected to the DOM.
   * Loads and appends the stimulus if the 'qti-assessment-stimulus-ref-connected' event is not prevented.
   */
  public async connectedCallback(): Promise<void> {
    super.connectedCallback();

    const event = new Event('qti-assessment-stimulus-ref-connected', { cancelable: true, bubbles: true });
    const isPrevented = this.dispatchEvent(event);

    if (isPrevented) {
      const item = this.closest('qti-assessment-item');

      const stimulusRef = item.querySelector(`[data-stimulus-idref=${this.identifier}]`);
      if (stimulusRef) {
        await this.updateStimulusRef(stimulusRef);
      } else {
        console.warn(`Stimulus with data-stimulus-idref ${this.identifier} not found`);
      }
    }
  }

  /**
   * Loads and appends the stimulus to the specified element.
   * @param stimulusRef - The element to which the stimulus will be appended.
   */
  public async updateStimulusRef(stimulusRef: Element) {
    const stimulus = await qtiTransformItem()
      .load(this.href)
      .then(api => api.htmlDoc());
    if (stimulus) {
      const elements = stimulus.querySelectorAll('qti-stimulus-body, qti-stylesheet');
      stimulusRef.innerHTML = '';
      stimulusRef.append(...elements);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-stimulus-ref': QtiAssessmentStimulusRef;
  }
}
