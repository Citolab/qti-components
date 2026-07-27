import { css, html, nothing } from 'lit';

import { QtiInlineChoiceInteraction } from '@qti-components/inline-choice-interaction/elements';

import { CandidateCorrectionMixin } from '../mixins/candidate-correction.mixin';
import { correctionPart } from '../styles/correction.styles';

export class QtiInlineChoiceInteractionCorrection extends CandidateCorrectionMixin(QtiInlineChoiceInteraction) {
  #correctOption: unknown = nothing;

  static override get styles() {
    return [
      QtiInlineChoiceInteraction.styles,
      correctionPart,
      css`
        :host {
          --qti-inline-choice-correct-option-margin: var(--qti-gap);
        }

        /*
         * Only the TRAILING inset — the leading gap is the shared --qti-glyph-gap, like every other
         * badge. This used to set both margins to --qti-gap (1rem), twice everyone else's 0.5em, on
         * the one token qti-variables.css calls "the page's rhythm … an order of magnitude too wide
         * for a glyph sitting inside a line".
         *
         * The trailing inset is needed here, and in text-entry, because these two put the field's box
         * on the HOST while its padding sits on an inner element (::part(trigger), ::part(input)) —
         * so a badge that is a child of the host falls outside that padding and lands on the border.
         * Chips, choices and hottext carry their padding on the host, so their badge is already inset
         * by it and needs nothing.
         */
        [part~='correction'] {
          margin-inline-end: var(--qti-correction-inset);
        }

        [part='correct-option'] {
          display: inline-block;
          margin: 0 var(--qti-inline-choice-correct-option-margin);
        }
      `
    ];
  }

  public override toggleInternalCorrectResponse(show: boolean): void {
    super.toggleInternalCorrectResponse(show);
    const response = this.correctResponse;
    const correctIdentifier = Array.isArray(response) ? response[0] : response;
    const option = show && correctIdentifier ? this.options.find(item => item.value === correctIdentifier) : undefined;
    const previous = this.#correctOption;
    this.#correctOption = option ? html`<span part="correct-option">${option.content}</span>` : nothing;
    this.requestUpdate('correctOption', previous);
  }

  /** Badge and answer-key option both trail the validation message; everything else is the base's. */
  override render() {
    return html`
      ${this.renderTrigger()} ${this.renderMenu()} ${this.renderValidationMessage()}
      <span part=${this.correctionPart} aria-hidden="true"></span>${this.#correctOption}
    `;
  }
}
