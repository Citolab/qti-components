import type { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { customElement, property } from 'lit/decorators.js';
import { QtiItem } from '../qti-item';

@customElement('qti-assessment-item-ref')
export class QtiAssessmentItemRef extends QtiItem {
  @property({ type: String }) key: string | undefined;
  @property({ type: String }) category?: string;

  weigths: Map<string, number> = new Map();

  constructor() {
    super();
    this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<QtiAssessmentItem>) => {
      const weightElements = e.detail.querySelectorAll('qti-weight');
      weightElements.forEach((weightElement: HTMLElement) => {
        const identifier = weightElement.getAttribute('identifier');
        try {
          if (!identifier) throw new Error('Missing identifier');
          if (this.weigths.has(identifier)) throw new Error(`Duplicate identifier: ${identifier}`);
          const numberValue = parseFloat(weightElement.getAttribute('value')!);
          if (isNaN(numberValue)) throw new Error(`Invalid value: ${numberValue}`);
          this.weigths.set(identifier!, numberValue);
        } catch (error) {
          console.error(error);
        }
      });
    });
  }

  // override render = () => html`<slot name="top"></slot>`;
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-item-ref': QtiAssessmentItemRef;
  }
}
