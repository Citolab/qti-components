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
          --qti-inline-choice-correction-gap-inline-start: var(--qti-gap);
          --qti-inline-choice-correction-gap-inline-end: var(--qti-gap);
        }
        [part~='correction'] {
          margin-left: var(--qti-inline-choice-correction-gap-inline-start);
          margin-inline-end: var(--qti-inline-choice-correction-gap-inline-end);
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

  protected override renderSupplementalContent(): unknown {
    return html`<span part=${this.correctionPart} aria-hidden="true"></span>${this.#correctOption}`;
  }
}
