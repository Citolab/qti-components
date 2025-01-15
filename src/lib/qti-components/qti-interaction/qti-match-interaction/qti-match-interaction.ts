import type { CSSResultGroup } from 'lit';
import { html, nothing } from 'lit';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { ResponseInteraction } from '../../../exports/expression-result';
import '../qti-simple-associable-choice';
import type { QtiSimpleAssociableChoice } from '../qti-simple-associable-choice';
import styles from './qti-match-interaction.styles';
import { Interaction } from '../../../exports/interaction';

@customElement('qti-match-interaction')
export class QtiMatchInteraction extends DragDropInteractionMixin(
  Interaction,
  'qti-simple-match-set:first-of-type qti-simple-associable-choice, qti-simple-match-set:last-of-type > qti-simple-associable-choice > qti-simple-associable-choice',
  'qti-simple-match-set:last-of-type > qti-simple-associable-choice',
  'qti-simple-match-set:first-of-type'
) {
  static styles: CSSResultGroup = styles;

  protected rows: QtiSimpleAssociableChoice[];
  protected cols: QtiSimpleAssociableChoice[];
  protected lastCheckedRadio: HTMLInputElement | null = null;

  @property({ type: String }) class: string = '';
  @state() protected _response: string | string[] = [];
  // dragDropApi: TouchDragAndDrop;
  get value(): string[] {
    if (!this.classList.contains('qti-match-tabular')) return super.value as string[];
    else return this._response as string[];
  }
  set value(val: string[]) {
    if (!this.classList.contains('qti-match-tabular')) super.value = val;
    else this._response = val;
  }
  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier: string = '';
  @state() protected correctOptions: string[] = [];

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.rows = Array.from<QtiSimpleAssociableChoice>(
      this.querySelectorAll('qti-simple-match-set:first-of-type qti-simple-associable-choice')
    );
    this.cols = Array.from<QtiSimpleAssociableChoice>(
      this.querySelectorAll('qti-simple-match-set:last-of-type qti-simple-associable-choice')
    );

    this.value = [];
  }

  protected handleRadioClick = e => {
    const radio = e.target as HTMLInputElement;
    if (this.lastCheckedRadio === radio) {
      radio.checked = false;
      this.lastCheckedRadio = null;
      this.handleRadioChange(e);
    } else {
      this.lastCheckedRadio = radio;
    }
  };

  protected handleRadioChange = e => {
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
    const isTabular = this.class.split(' ').includes('qti-match-tabular');
    return html`
      <slot name="prompt"></slot>
      <slot ?hidden=${isTabular}></slot>

      ${isTabular
        ? html`
            <table>
              <tr>
                <td></td>
                ${this.cols.map(col => html`<th part="r-header">${unsafeHTML(col.innerHTML)}</th>`)}
              </tr>

              ${this.rows.map(
                row =>
                  html`<tr>
                    <td part="c-header">${unsafeHTML(row.innerHTML)}</td>
                    ${this.cols.map(col => {
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
          `
        : nothing}

      <div role="alert" id="validationMessage"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-match-interaction': QtiMatchInteraction;
  }
}
