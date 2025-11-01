import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { watch } from '../../../src/lib/decorators/watch';

@customElement('qti-rubric-block')
export class QtiRubricBlock extends LitElement {
  @property({ type: String }) override id; // ="qtiAspectInhoudRubricBlock"

  @property({ type: String }) use: 'instructions' | 'scoring' | 'navigation'; //  = "scoring"

  @property({ type: String }) view: 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor';

  @property({ type: String, attribute: 'class' }) classNames;
  @watch('classNames', { waitUntilFirstUpdate: true })
  handleclassNamesChange() {
    const classNames = this.classNames.split(' ');
    classNames.forEach((className: string) => {
      switch (className) {
        case 'qti-rubric-discretionary-placement':
          {
            const event = new CustomEvent('qti-rubric:discretionary-placement', {
              detail: { className, element: this },
              bubbles: true,
              composed: true,
              cancelable: true
            });
            const notCancelled = this.dispatchEvent(event);
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
