import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { consume } from '@lit/context';

import { Interaction } from '../../../exports/interaction';
import { configContext } from '../../../exports/config.context';

import type { PropertyValues } from 'lit';
import type { ConfigContext } from '../../../exports/config.context';

interface OptionType {
  textContent: string;
  value: string;
  selected: boolean;
}

@customElement('qti-inline-choice-interaction')
export class QtiInlineChoiceInteraction extends Interaction {
  get isInline(): boolean {
    return true;
  }

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
  protected options: OptionType[] = [];

  @state()
  protected correctOption: string = '';

  @property({ attribute: 'data-prompt', type: String })
  dataPrompt: string = '';

  @consume({ context: configContext, subscribe: true })
  @property({ attribute: false })
  declare configContext: ConfigContext;

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
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('on-dropdown-selected', this.choiceSelected);
  }

  override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('configContext') || changed.has('dataPrompt')) {
      this._updateOptions();
    }
  }

  private _updateOptions() {
    const choices = Array.from(this.querySelectorAll('qti-inline-choice'));
    const prompt = this.dataPrompt || this.configContext?.inlineChoicePrompt || 'select';
    if (!this.options || this.options.length === 0) {
      this.options = [
        {
          textContent: prompt,
          value: '',
          selected: false
        },
        ...choices.map(choice => ({
          textContent: choice.innerHTML,
          value: choice.getAttribute('identifier'),
          selected: false
        }))
      ];
    } else {
      this.options = this.options.map(o => {
        return o.value === '' ? { ...o, textContent: prompt } : o;
      });
    }
  }

  public validate(): boolean {
    const selectedOption = this.options.find(option => option.selected);
    return selectedOption ? selectedOption.value !== '' : false;
  }

  public reset() {
    this.options = this.options.map((option, i) => ({ ...option, selected: i === 0 }));
  }

  public set response(value: string | null) {
    this.options = this.options.map(option => {
      if (value && value === option.value) {
        option.selected = true;
      }
      return option;
    });
  }
  get response(): string | null {
    return this.options.find(option => option.selected)?.value || null;
  }

  toggleInternalCorrectResponse(show: boolean) {
    this.correctResponse = show && this.responseVariable?.correctResponse?.toString();
    if (!this.correctResponse) {
      this.correctOption = '';
      return;
    }

    // textSpan.classList.add('correct-option');
    //       textSpan.textContent = text;

    //       // Apply styles
    //       textSpan.style.border = '1px solid var(--qti-correct)';
    //       textSpan.style.borderRadius = '4px';
    //       textSpan.style.padding = '2px 4px';
    //       textSpan.style.margin = '4px';
    //       textSpan.style.display = 'inline-block';

    this.correctOption = `<span part="correct-option" style="border:1px solid var(--qti-correct); border-radius:4px; padding: 2px 4px; margin: 4px; display:inline-block">${
      this.options.find(option => this.correctResponse === option.value).textContent
    }</span>`;
  }

  protected choiceSelected(event: Event) {
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
