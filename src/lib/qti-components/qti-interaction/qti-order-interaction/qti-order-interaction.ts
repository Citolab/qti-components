import { css, html, LitElement } from 'lit';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';
import { property } from 'lit/decorators.js';

export class QtiOrderInteraction extends DragDropInteractionMixin(LitElement, `qti-simple-choice`, true, 'drop-list') {
  childrenMap: Element[];
  private _classNames: string;
  private _orientation: 'vertical' | 'horizontal';

  public static layoutClass = ['qti-choices-top', 'qti-choices-bottom', 'qti-choices-left', 'qti-choices-right'];

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
    return html` <slot name="prompt"> </slot>
      <div part="container">
        <slot part="drags"> </slot>
        <div part="drops">
          ${Array.from(this.querySelectorAll('qti-simple-choice')).map(
            (_, i) => html`<drop-list part="drop-list" identifier="droplist${i}"></drop-list>`
          )}
        </div>
      </div>`;
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

customElements.define('qti-order-interaction', QtiOrderInteraction);
