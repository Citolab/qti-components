import { html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { Interaction } from '@qti-components/base';

import { DragDropInteractionMixin } from '../../mixins/drag-drop';
import styles from './qti-match-interaction.styles';

import type { ResponseVariable } from '@qti-components/base';
import type { CSSResultGroup } from 'lit';
import type { ResponseInteraction } from '@qti-components/base';
import type { QtiSimpleAssociableChoice } from '../../elements/qti-simple-associable-choice';
export class QtiMatchInteraction extends DragDropInteractionMixin(
  Interaction,
  'qti-simple-match-set:first-of-type qti-simple-associable-choice, qti-simple-match-set:last-of-type > qti-simple-associable-choice > qti-simple-associable-choice',
  'qti-simple-match-set:last-of-type > qti-simple-associable-choice',
  'qti-simple-match-set:first-of-type'
) {
  static override styles: CSSResultGroup = styles;

  protected sourceChoices: QtiSimpleAssociableChoice[];
  protected targetChoices: QtiSimpleAssociableChoice[];
  protected lastCheckedRadio: HTMLInputElement | null = null;

  @property({ type: String }) class: string = '';

  @state() protected _response: string | string[] = [];
  // dragDropApi: TouchDragAndDrop;
  get response(): string[] {
    if (!this.classList.contains('qti-match-tabular')) return super.response as string[];
    else return this._response as string[];
  }
  set response(val: string[]) {
    if (!this.classList.contains('qti-match-tabular')) super.response = val;
    else this._response = val;
  }

  @property({ type: String, attribute: 'response-identifier' }) override responseIdentifier: string = '';

  @state() protected correctOptions: { source: string; target: string }[] = null;

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.sourceChoices = Array.from<QtiSimpleAssociableChoice>(
      this.querySelectorAll('qti-simple-match-set:first-of-type qti-simple-associable-choice')
    );
    this.targetChoices = Array.from<QtiSimpleAssociableChoice>(
      this.querySelectorAll('qti-simple-match-set:last-of-type qti-simple-associable-choice')
    );

    this.response = [];
  }

  protected handleRadioClick = (e: { target: HTMLInputElement }) => {
    const radio = e.target as HTMLInputElement;
    if (this.lastCheckedRadio === radio) {
      radio.checked = false;
      this.lastCheckedRadio = null;
      this.handleRadioChange(e);
    } else {
      this.lastCheckedRadio = radio;
    }
  };

  protected handleRadioChange = (e: { target: any }) => {
    const checkbox = e.target as HTMLInputElement;
    const value = checkbox.value;
    const name = checkbox.name;
    const type = checkbox.type;

    if (checkbox.checked) {
      if (!this.response) {
        this.response = [value];
      } else if (this.response.indexOf(value) === -1) {
        if (type === 'radio') {
          this.response = (this.response || []).filter(v => v.indexOf(name) === -1);
        }
        this.response = [...this.response, value];
      }
      this.lastCheckedRadio = checkbox;
    } else {
      this.response = (this.response || []).filter(v => v !== value);
      this.lastCheckedRadio = null;
    }

    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent<ResponseInteraction>('qti-interaction-response', {
        bubbles: true,
        composed: true,
        detail: {
          responseIdentifier: this.responseIdentifier,
          response: Array.isArray(this.response) ? [...this.response] : this.response
        }
      })
    );
  };

  validate(): boolean {
    if (this.class.split(' ').includes('qti-match-tabular')) {
      return this.response?.length === this.sourceChoices.length;
    } else {
      return super.validate();
    }
  }

  private getMatches(responseVariable: ResponseVariable): { source: string; target: string }[] {
    if (!responseVariable.correctResponse) {
      return [];
    }
    const correctResponse = Array.isArray(responseVariable.correctResponse)
      ? responseVariable.correctResponse
      : [responseVariable.correctResponse];

    const matches: { source: string; target: string }[] = [];
    if (correctResponse) {
      correctResponse.forEach(x => {
        const split = x.split(' ');
        matches.push({ source: split[0], target: split[1] });
      });
    }
    return matches;
  }

  public override toggleInternalCorrectResponse(show: boolean): void {
    const responseVariable = this.responseVariable;

    if (!responseVariable?.correctResponse) {
      // Remove all previously added correct responses
      this.querySelectorAll('.correct-option').forEach(el => el.remove());
      return;
    }
    const matches = this.getMatches(responseVariable);

    if (!this.class.split(' ').includes('qti-match-tabular')) {
      if (show) {
        // Clear old correct options first
        this.querySelectorAll('.correct-option').forEach(el => el.remove());

        this.targetChoices.forEach(targetChoice => {
          const targetId = targetChoice.getAttribute('identifier');
          const match = matches.find(m => m.target === targetId);

          if (match?.source) {
            const sourceChoice = this.querySelector(`qti-simple-associable-choice[identifier="${match.source}"]`);
            const text = sourceChoice?.textContent?.trim();

            if (text && !targetChoice.previousElementSibling?.classList.contains('correct-option')) {
              const textSpan = document.createElement('span');
              textSpan.classList.add('correct-option');
              textSpan.textContent = text;

              // Style the span
              textSpan.style.border = '1px solid var(--qti-correct)';
              textSpan.style.borderRadius = '4px';
              textSpan.style.padding = '2px 4px';
              textSpan.style.display = 'inline-block';

              // Insert before the target choice
              targetChoice.insertAdjacentElement('beforebegin', textSpan);
            }
          }
        });
      } else {
        this.correctOptions = null;
      }
    } else {
      if (show) {
        this.correctOptions = matches || [];
      } else {
        this.correctOptions = null;
      }
    }
  }

  public override toggleCandidateCorrection(show: boolean) {
    const responseVariable = this.responseVariable;

    if (!responseVariable?.correctResponse) {
      return;
    }
    const matches = this.getMatches(responseVariable);

    this.targetChoices.forEach(targetChoice => {
      const targetId = targetChoice.getAttribute('identifier');
      const targetMatches = matches.filter(m => m.target === targetId);

      const selectedChoices = targetChoice.querySelectorAll(`qti-simple-associable-choice`);

      selectedChoices.forEach(selectedChoice => {
        selectedChoice.internals.states.delete('candidate-correct');
        selectedChoice.internals.states.delete('candidate-incorrect');

        if (!show) {
          return;
        }

        const isCorrect = targetMatches.find(m => m.source === selectedChoice.identifier)?.source !== undefined;
        if (isCorrect) {
          selectedChoice.internals.states.add('candidate-correct');
        } else {
          selectedChoice.internals.states.add('candidate-incorrect');
        }
      });
    });
  }

  override render() {
    const isTabular = this.class.split(' ').includes('qti-match-tabular');
    const hasCorrectResponse = this.correctOptions !== null;
    return html`
      <slot name="prompt"></slot>
      <slot ?hidden=${isTabular}></slot>

      ${isTabular
        ? html`
            <table part="table">
              <tr part="r-header">
                <td></td>
                ${this.targetChoices.map(col => html`<th part="r-header">${unsafeHTML(col.innerHTML)}</th>`)}
              </tr>

              ${this.sourceChoices.map(
                row =>
                  html`<tr part="row">
                    <td part="c-header">${unsafeHTML(row.innerHTML)}</td>
                    ${this.targetChoices.map(col => {
                      const rowId = row.getAttribute('identifier');
                      const colId = col.getAttribute('identifier');
                      const value = `${rowId} ${colId}`;
                      const selectedInRowCount =
                        (this.response || []).filter(v => v.split(' ')[0] === rowId).length || 0;
                      const checked = this.response?.includes(value) || false;
                      const type = row.matchMax === 1 ? 'radio' : 'checkbox';
                      const isCorrect = !!this.correctOptions?.find(
                        option => option.source === rowId && option.target === colId
                      );
                      const part =
                        type === 'radio'
                          ? `rb ${checked ? 'rb-checked' : ''} ${hasCorrectResponse ? (isCorrect ? 'rb-correct' : 'rb-incorrect') : ''}`
                          : `cb ${checked ? 'cb-checked' : ''} ${hasCorrectResponse ? (isCorrect ? 'cb-correct' : 'cb-incorrect') : ''}`;

                      // disable if match max is greater than 1 and max is reached
                      const disable =
                        this.correctOptions?.length > 0
                          ? true
                          : row.matchMax === 1
                            ? false
                            : row.matchMax !== 0 && selectedInRowCount >= row.matchMax && !checked;
                      return html`<td part="input-cell">
                        <div
                          class="input-container"
                          style="position: relative; width: 24px; height: 24px; margin: 0 auto;"
                        >
                          <input
                            type=${type}
                            part=${part}
                            name=${rowId}
                            value=${value}
                            .disabled=${disable}
                            @change=${(e: { target: any }) => this.handleRadioChange(e)}
                            @click=${(e: { target: HTMLInputElement }) =>
                              row.matchMax === 1 ? this.handleRadioClick(e) : null}
                          />
                          ${type === 'checkbox' && checked
                            ? html`
                                <svg
                                  part="checkmark"
                                  viewBox="0 0 24 24"
                                  style="position: absolute; width: 20px; height: 20px; top: 2px; left: 2px; pointer-events: none;"
                                >
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
                                </svg>
                              `
                            : ''}
                        </div>
                      </td>`;
                    })}
                  </tr>`
              )}
            </table>
          `
        : nothing}

      <div role="alert" part="message" id="validation-message"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-match-interaction': QtiMatchInteraction;
  }
}
