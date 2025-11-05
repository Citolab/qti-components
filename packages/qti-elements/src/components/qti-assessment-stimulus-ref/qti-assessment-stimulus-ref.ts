import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { qtiTransformItem } from '@qti-components/transformers';

import type { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

export class QtiAssessmentStimulusRefConnectedEvent extends Event {
  public static eventName = 'qti-assessment-stimulus-ref-connected';
  constructor(
    public element: QtiAssessmentStimulusRef,
    public item: QtiAssessmentItem
  ) {
    super(QtiAssessmentStimulusRefConnectedEvent.eventName, { bubbles: true, composed: true, cancelable: true });
  }
}

/**
 * Represents a custom element for referencing an assessment stimulus.
 */
@customElement('qti-assessment-stimulus-ref')
export class QtiAssessmentStimulusRef extends LitElement {
  @property({ type: String }) identifier = '';
  @property({ type: String }) href = '';

  /**
   * Lifecycle method called when the element is connected to the DOM.
   * First checks if there's a data-stimulus-idref element. If found, loads the stimulus directly.
   * If not found, delegates to the delivery platform via an event.
   */
  public override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    // VERY important to wait for updateComplete to ensure that the stimulusRef is connected after item
    // for the test-navigation to correctly process everything in order
    await this.updateComplete;

    const item = this.closest<QtiAssessmentItem>('qti-assessment-item');

    const event = new QtiAssessmentStimulusRefConnectedEvent(this, item);
    this.dispatchEvent(event);

    const stimulusRef = item?.querySelector(`[data-stimulus-idref="${this.identifier}"]`);
    if (!event.defaultPrevented && stimulusRef) {
      await this.updateStimulusRef(stimulusRef);
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
