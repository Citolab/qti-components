import { html, LitElement, PropertyValues } from 'lit';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';

import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ResponseInteraction } from '../../internal/expression-result';
import '../qti-simple-associable-choice';
import { QtiSimpleAssociableChoice } from '../qti-simple-associable-choice';

interface Column {
  id: number;
  name: string;
}

interface Row {
  id: number;
  name: string;
  isChecked: boolean;
}

@customElement('qti-match-interaction')
export class QtiMatchInteraction extends DragDropInteractionMixin(
  LitElement,
  'qti-simple-match-set:first-of-type qti-simple-associable-choice',
  false,
  'qti-simple-match-set:last-of-type qti-simple-associable-choice'
) {
  static override styles = [];
  rows: QtiSimpleAssociableChoice[];
  cols: QtiSimpleAssociableChoice[];
  lastCheckedRadio: HTMLInputElement | null = null;

  @state() response = [];
  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier: string = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.rows = Array.from<QtiSimpleAssociableChoice>(
      // eslint-disable-next-line wc/no-child-traversal-in-connectedcallback
      this.querySelectorAll('qti-simple-match-set:first-of-type qti-simple-associable-choice')
    );
    this.cols = Array.from<QtiSimpleAssociableChoice>(
      // eslint-disable-next-line wc/no-child-traversal-in-connectedcallback
      this.querySelectorAll('qti-simple-match-set:last-of-type qti-simple-associable-choice')
    );

    this.response = [];
  }

  handleRadioClick = e => {
    const radio = e.target as HTMLInputElement;
    if (this.lastCheckedRadio === radio) {
      radio.checked = false;
      this.lastCheckedRadio = null;
      this.handleRadioChange(e);
    } else {
      this.lastCheckedRadio = radio;
    }
  };

  handleRadioChange = e => {
    const checkbox = e.target as HTMLInputElement;
    const value = checkbox.value;
    if (checkbox.checked) {
      this.response.push(value);
      this.lastCheckedRadio = checkbox;
    } else {
      this.response = this.response.filter(v => v !== value);
      this.lastCheckedRadio = null;
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
  };

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
                const rowId = row.getAttribute('identifier');
                const colId = col.getAttribute('identifier');
                const value = `${rowId} ${colId}`;
                const selectedInRowCount = this.response.filter(v => v.split(' ')[0] === rowId).length || 0;
                const checked = this.response.includes(value);
                // disable if match max is greater than 1 and max is reached
                const disable = row.matchMax === 1 ? false : selectedInRowCount >= row.matchMax && !checked;
                return html`<td>
                  <input
                    type=${row.matchMax === 1 ? 'radio' : `checkbox`}
                    role="id"
                    name=${rowId}
                    value=${value}
                    .disabled=${disable}
                    .checked=${checked}
                    @change=${e => this.handleRadioChange(e)}
                    @click=${e => (row.matchMax === 1 ? this.handleRadioClick(e) : null)}
                  />
                </td>`;
              })}
            </tr>`
        )}
      </table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-match-interaction': QtiMatchInteraction;
  }
}
