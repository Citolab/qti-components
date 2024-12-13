import { CSSResultGroup, html, LitElement } from 'lit';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ResponseInteraction } from '../../internal/expression-result';
// import { TouchDragAndDrop } from '../internal/drag-drop';
import '../qti-simple-associable-choice';
import { QtiSimpleAssociableChoice } from '../qti-simple-associable-choice';
import styles from './qti-match-interaction.styles';
import { Interaction } from '../internal/interaction/interaction';

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
  Interaction,
  'qti-simple-match-set:first-of-type qti-simple-associable-choice',
  'qti-simple-match-set:last-of-type qti-simple-associable-choice',
  'qti-simple-match-set'
) {
  static styles: CSSResultGroup = styles;

  rows: QtiSimpleAssociableChoice[];
  cols: QtiSimpleAssociableChoice[];
  lastCheckedRadio: HTMLInputElement | null = null;

  @state() _response: string | string[] = [];
  // dragDropApi: TouchDragAndDrop;
  get value(): string[] {
    if (!this.classList.contains('qti-match-tabular')) return super.value as string[];
    else return this._response as string[];
  }
  set value(val: string[]) {
    if (!this.classList.contains('qti-match-tabular')) super.value = val;
    else this._response = val;
  }
  @state() correctOptions: string[] = [];
  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier: string = '';

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    // await this.updateComplete;
    // this.dragDropApi = new TouchDragAndDrop();
    // this.dragDropApi.addDraggableElements(
    //   this.querySelectorAll('qti-simple-match-set:first-of-type qti-simple-associable-choice')
    // );
    // this.dragDropApi.addDroppableElements(
    //   this.querySelectorAll('qti-simple-match-set:last-of-type qti-simple-associable-choice')
    // );
    this.rows = Array.from<QtiSimpleAssociableChoice>(
      this.querySelectorAll('qti-simple-match-set:first-of-type qti-simple-associable-choice')
    );
    this.cols = Array.from<QtiSimpleAssociableChoice>(
      this.querySelectorAll('qti-simple-match-set:last-of-type qti-simple-associable-choice')
    );

    this.value = [];
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
    const name = checkbox.name;
    const type = checkbox.type;

    if (checkbox.checked) {
      if (!this.value) {
        this.value = [value];
      } else if (this.value.indexOf(value) === -1) {
        if (type === 'radio') {
          this.value = this.value.filter(v => v.indexOf(name) === -1);
        }
        this.value = [...this.value, value];
      }
      this.lastCheckedRadio = checkbox;
    } else {
      this.value = this.value.filter(v => v !== value);
      this.lastCheckedRadio = null;
    }

    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent<ResponseInteraction>('qti-interaction-response', {
        bubbles: true,
        composed: true,
        detail: {
          responseIdentifier: this.responseIdentifier,
          response: Array.isArray(this.value) ? [...this.value] : this.value
        }
      })
    );
  };

  set correctResponse(responseValue: string | string[]) {
    if (responseValue === '') {
      this.correctOptions = [];
      return;
    } else if (Array.isArray(responseValue)) {
      this.correctOptions = responseValue;
    }
  }

  override render() {
    if (!this.classList.contains('qti-match-tabular')) {
      return html`<slot name="prompt"></slot> <slot></slot>
        <div role="alert" id="validationMessage"></div>`;
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
                const selectedInRowCount = this.value.filter(v => v.split(' ')[0] === rowId).length || 0;
                const checked = this.value.includes(value);
                const part = `rb ${checked ? 'rb-checked' : ''} ${this.correctOptions.includes(value) ? 'rb-correct' : ''}`;
                // disable if match max is greater than 1 and max is reached
                const disable =
                  this.correctOptions.length > 0
                    ? true
                    : row.matchMax === 1
                      ? false
                      : selectedInRowCount >= row.matchMax && !checked;
                return html`<td>
                  <input
                    type=${row.matchMax === 1 ? 'radio' : `checkbox`}
                    part=${part}
                    name=${rowId}
                    value=${value}
                    .disabled=${disable}
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
