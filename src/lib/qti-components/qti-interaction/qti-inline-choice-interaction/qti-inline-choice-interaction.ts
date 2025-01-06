import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Interaction } from '../internal/interaction/interaction';

interface OptionType {
  textContent: string;
  value: string;
  selected: boolean;
}

@customElement('qti-inline-choice-interaction')
export class QtiInlineChoiceInteraction extends Interaction {
  static override get styles() {
    return [
      css`
        :host {
          display: inline-block;
        }
        slot {
          display: flex;
          flex-direction: column;
        }
        [role='menu'] {
          position: absolute;
          z-index: 1000;
        }
        .anchor {
          /* anchor-name: --infobox; */
          width: fit-content;
        }

        .positionedElement {
          position: absolute;
          /* position-anchor: --infobox; */
          /* top: anchor(bottom); */
        }
      `
    ];
  }

  public static inputWidthClass = [
    '',
    'qti-input-width-2',
    'qti-input-width-1',
    'qti-input-width-3',
    'qti-input-width-4',
    'qti-input-width-6',
    'qti-input-width-10',
    'qti-input-width-15',
    'qti-input-width-20',
    'qti-input-width-72'
  ];

  @state()
  private options: OptionType[] = [];

  @state()
  private correctOption: string = '';

  @property({ attribute: 'data-prompt', type: String })
  dataPrompt: string = 'select';

  override render() {
    return html`
      <select part="select" @change="${this.choiceSelected}" ?disabled="${this.disabled}" ?readonly="${this.readonly}">
        ${this.options.map(
          option => html`
            <option value="${option.value}" ?selected="${option.selected}">${unsafeHTML(option.textContent)}</option>
          `
        )}
      </select>

      ${unsafeHTML(this.correctOption)}
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('on-dropdown-selected', this.choiceSelected);
    const choices = Array.from(this.querySelectorAll('qti-inline-choice'));
    this.options = [
      {
        textContent: this.dataPrompt,
        value: '',
        selected: false
      },
      ...choices.map(choice => ({
        textContent: choice.innerHTML,
        value: choice.getAttribute('identifier'),
        selected: false
      }))
    ];
  }

  disconnectedCallback() {
    this.removeEventListener('on-dropdown-selected', this.choiceSelected);
  }

  public validate(): boolean {
    const selectedOption = this.options.find(option => option.selected);
    return selectedOption ? selectedOption.value !== '' : false;
  }

  public reset() {
    this.options = this.options.map((option, i) => ({ ...option, selected: i === 0 }));
  }

  public set value(value: string) {
    this.options = this.options.map(option => {
      if (value === option.value) {
        option.selected = true;
      }
      return option;
    });
  }
  get value(): string {
    return this.options.find(option => option.selected).value;
  }

  set correctResponse(value: string | string[]) {
    if (value === '') {
      this.correctOption = '';
      return;
    }
    this.correctOption = `<span part="correct-option">${
      this.options.find(option => value === option.value).textContent
    }</span>`;
  }

  private choiceSelected(event: Event) {
    const selectedOptionValue = (event.target as HTMLSelectElement).value;
    this.options = this.options.map(option => ({ ...option, selected: option.value === selectedOptionValue }));
    this.saveResponse(selectedOptionValue);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-inline-choice-interaction': QtiInlineChoiceInteraction;
  }
}
