import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

@customElement('qti-order-interaction')
export class QtiOrderInteraction extends DragDropInteractionMixin(LitElement, `qti-simple-choice`, true, 'drop-list') {
  childrenMap: Element[];
  private _classNames: string;
  private _orientation: 'vertical' | 'horizontal';

  public static layoutClass = ['qti-choices-top', 'qti-choices-bottom', 'qti-choices-left', 'qti-choices-right'];

  @state() nrChoices: number = 0;
  @state() correctResponses: string[] = [];  
  @state() showCorrectResponses: boolean = false;

  /** orientation of choices */
  @property({ type: String })
  public orientation: 'horizontal' | 'vertical';

  static override styles = [
    css`
      [part='drags'] {
        display: flex;
        align-items: flex-start;
        flex: 1;
      }

      [part='drops'] {
        flex: 1;
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
      }

      :host([orientation='horizontal']) [part='drags'] {
        flex-direction: row;
      }
      :host([orientation='horizontal']) [part='drops'] {
        grid-auto-flow: column;
      }
      :host([orientation='vertical']) [part='drags'] {
        flex-direction: column;
      }
      :host([orientation='vertical']) [part='drops'] {
        grid-auto-flow: row;
      }

      [part='drop-list'] {
        display: block;
        flex: 1;
      }

      [part='container'] {
        display: flex;
        gap: 0.5rem;
      }
      :host(.qti-choices-top) [part='container'] {
        flex-direction: column;
      }
      :host(.qti-choices-bottom) [part='container'] {
        flex-direction: column-reverse;
      }
      :host(.qti-choices-left) [part='container'] {
        flex-direction: row;
      }
      :host(.qti-choices-right) [part='container'] {
        flex-direction: row-reverse;
      }
    `
  ];

  override render() {
    const choices = Array.from(this.querySelectorAll('qti-simple-choice'));
    if (this.nrChoices < choices.length) {
      this.nrChoices = choices.length;
    }    

    return html` <slot name="prompt"> </slot>
      <div part="container">
        <slot part="drags"> </slot>
        <div part="drops">
          ${Array.from(Array(this.nrChoices)).map(
            (_, i) => html`<drop-list part="drop-list" identifier="droplist${i}"></drop-list>${this.showCorrectResponses && this.correctResponses.length > i ? unsafeHTML(`<span part='correct-response'>${this.correctResponses[i]}</span>`) : ''}`
          )}
        </div>
      </div>`;
  }

  set correctResponse(value: Readonly<string | string[]>) {     
    if (value === '') {
      this.showCorrectResponses = false;
      return
    } 
    
    if (this.correctResponses.length === 0) {
      const responses = Array.isArray(value) ? value : [value];

      responses.forEach((response, index) => {
        let simpleChoice = this.querySelector(`qti-simple-choice[identifier="${response}"]`);
        if (!simpleChoice) {
          simpleChoice = this.shadowRoot.querySelector(`qti-simple-choice[identifier="${response}"]`);
        }

        const text = simpleChoice?.textContent.trim();
        this.correctResponses = [...this.correctResponses, text];
      })    
    }

    this.showCorrectResponses = true;
  }

  override connectedCallback() {
    super.connectedCallback();
    // INFRINGEMENT..
    // PK: if children are dropped into shadowdom, styling is lost, so we add a part selector on all children
    // I they get lost into shadow dom after dropped, they can still be styled via lightdom part selectors
    this.childrenMap = Array.from(this.querySelectorAll('qti-simple-choice'));
    this.childrenMap.forEach(el => el.setAttribute('part', 'qti-simple-choice'));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-order-interaction': QtiOrderInteraction;
  }
}
