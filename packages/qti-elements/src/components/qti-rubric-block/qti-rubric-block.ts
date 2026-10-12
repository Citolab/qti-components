import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';

import { watch } from '@qti-components/utilities';

import { dispatchPublic } from '../../public-events';

export class QtiRubricBlock extends LitElement {
  @property({ type: String }) override id: string; // ="qtiAspectInhoudRubricBlock"

  @property({ type: String }) use: 'instructions' | 'scoring' | 'navigation'; //  = "scoring"

  @property({ type: String }) view: 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor';

  @property({ type: String, attribute: 'class' }) classNames: string;
  @watch('classNames', { waitUntilFirstUpdate: true })
  handleclassNamesChange() {
    const classNames = this.classNames.split(' ');
    classNames.forEach((className: string) => {
      switch (className) {
        case 'qti-rubric-discretionary-placement':
          {
            const notCancelled = dispatchPublic(this, 'cito-item-rubric-placement', { className, element: this }, true);
            if (!notCancelled) return;
            this.setAttribute('slot', 'qti-rubric-block');
          }
          break;
        case 'qti-rubric-inline':
          this.setAttribute('slot', '');
          break;
        default:
          break;
      }
    });
  }

  static override styles = css`
    :host {
      display: block;
    }
  `;

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-rubric-block': QtiRubricBlock;
  }
}
