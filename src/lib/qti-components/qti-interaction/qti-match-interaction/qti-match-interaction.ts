import { html, LitElement } from 'lit';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';

import '../qti-simple-associable-choice';
import { property, state } from 'lit/decorators.js';
import { QtiSimpleAssociableChoice } from '../qti-simple-associable-choice';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ResponseInteraction } from '../../qti-utilities/ExpressionResult';

interface Column {
  id: number;
  name: string;
}

interface Row {
  id: number;
  name: string;
  isChecked: boolean;
}

export class QtiMatchInteraction extends DragDropInteractionMixin(
  LitElement,
  'qti-simple-match-set:first-of-type qti-simple-associable-choice',
  false,
  'qti-simple-match-set:last-of-type qti-simple-associable-choice'
) {
  static override styles = [];
  rows: QtiSimpleAssociableChoice[];
  cols: QtiSimpleAssociableChoice[];

  @state() response = [];
  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier: string = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.rows = Array.from<QtiSimpleAssociableChoice>(
      this.querySelectorAll('qti-simple-match-set:first-of-type qti-simple-associable-choice')
    );
    this.cols = Array.from<QtiSimpleAssociableChoice>(
      this.querySelectorAll('qti-simple-match-set:last-of-type qti-simple-associable-choice')
    );

    this.response = [];
  }

  override render() {
    if (!this.classList.contains('qti-match-tabular')) {
      return html`<slot name="prompt"></slot> <slot></slot>`;
    }
    return html`
      <slot name="prompt"></slot>
      <table>
        <tr>
          <td></td>
          ${this.cols.map((col, i) => html`<th part="r-header">${unsafeHTML(col.innerHTML)}</th>`)}
        </tr>
        ${this.rows.map(
          (row, rIndex) =>
            html`<tr>
              <td part="c-header">${unsafeHTML(row.innerHTML)}</td>
              ${this.cols.map((col, cIndex) => {
                const value = `${row.getAttribute('identifier')} ${col.getAttribute('identifier')}`;
                return html`<td>
                  <input
                    type="checkbox"
                    value=${col.getAttribute('identifier')}
                    .checked=${this.response.includes(value)}
                    @change=${e => {
                      const checkbox = e.target as HTMLInputElement;
                      if (checkbox.checked) {
                        this.response.push(value);
                      } else {
                        this.response = this.response.filter(v => v !== value);
                      }
                      this.requestUpdate();
                      this.dispatchEvent(
                        new CustomEvent<ResponseInteraction>('qti-interaction-response', {
                          bubbles: true,
                          composed: true,
                          detail: {
                            responseIdentifier: this.responseIdentifier,
                            response: this.response
                          }
                        })
                      );
                    }}
                  />
                </td>`;
              })}
            </tr>`
        )}
      </table>
    `;
  }
}

customElements.define('qti-match-interaction', QtiMatchInteraction);
