import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { watch } from '../../decorators/watch';

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
          this.setAttribute('slot', 'qti-rubric-block');
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

  override connectedCallback(): void {
    super.connectedCallback();
    // by default put this in a slot in the item-body
    this.setAttribute('slot', 'qti-rubric-block');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-rubric-block': QtiRubricBlock;
  }
}
