import { css, html } from 'lit';
import { Events } from '../../qti-utilities/EventStrings';
import { Interaction } from '../internal/interaction/interaction';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

interface OptionType {
  textContent: string;
  value: string;
  selected: boolean;
}
export class QtiInlineChoiceInteraction extends Interaction {
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

  @state() options: OptionType[] = [];

  @state() correctOption: string = '';

  @property({ attribute: 'data-prompt', type: String })
  dataPrompt: string = 'select';

  static override get styles() {
    return [
      css`
        :host {
          display: inline-block;
        }
      `
    ];
  }

  override render() {
    return html`
      <select part="select" @change="${this.choiceSelected}" ?disabled="${this.disabled}" ?readonly="${this.readonly}">
        ${this.options.map(
          option => html`
            <option value="${option.value}" ?selected="${option.selected}">${option.textContent}</option>
          `
        )}
      </select>

      ${unsafeHTML(this.correctOption)}
    `;
  }

  firstUpdated(val) {
    super.firstUpdated(val);
    this.addEventListener(Events.ON_DROPDOWN_SELECTED, this.choiceSelected);
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

  public validate(): boolean {
    const selectedOption = this.options.find(option => option.selected);
    return selectedOption ? selectedOption.value !== '' : false;
  }

  public reset() {
    this.options = this.options.map((option, i) => ({ ...option, selected: i === 0 }));
  }

  public set response(value: string) {
    this.options = this.options.map(option => {
      value === option.value && (option.selected = true);
      return option;
    });
  }

  set correctResponse(value: Readonly<string | string[]>) {
    if (value === '') {
      this.correctOption = '';
      return;
    }
    console.log('correctResponse', value);
    this.correctOption = this.options.find(option => value === option.value).textContent;
  }

  public choiceSelected(event: Event) {
    const selectedOptionValue = (event.target as HTMLSelectElement).value;
    this.options = this.options.map(option => ({ ...option, selected: option.value === selectedOptionValue }));
    this.saveResponse(selectedOptionValue);
  }
}

customElements.define('qti-inline-choice-interaction', QtiInlineChoiceInteraction);
