import { css, html } from 'lit';

import { QtiInlineChoiceInteraction } from '@qti-components/inline-choice-interaction/elements';

import { CandidateCorrectionMixin } from '../mixins/candidate-correction.mixin';
import { correctionPart } from '../styles/correction.styles';

export class QtiInlineChoiceInteractionCorrection extends CandidateCorrectionMixin(QtiInlineChoiceInteraction) {
  static override get styles() {
    return [
      QtiInlineChoiceInteraction.styles,
      correctionPart,
      css`
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
      `
    ];
  }

  /**
   * Internal mode defers to the full correct response, exactly as text-entry does.
   *
   * There is no room beside a dropdown for an answer key: the interaction sits inside a line of
   * running text, so a marker next to the field competes with the sentence around it, and when the
   * candidate happened to pick the correct option it printed the same word twice. The full variant
   * puts the key in a `div.full-correct-response-inline` after the field instead — one already-themed
   * presentation for both inline interactions rather than a second one only these two use.
   *
   * `super` is deliberately not called: its `show-correct-response` host state paints the dashed
   * outline in qti-states.css, and this element is no longer the thing presenting the key — the
   * wrapper beside it is. Leaving the state off keeps internal mode looking identical to an item
   * authored with `show-full-correct-response`.
   *
   * The guard stops the two entry points rendering two wrappers: `showFullCorrectResponse` has its
   * own watcher, so with both flags set this would otherwise run a second time.
   */
  public override toggleInternalCorrectResponse(show: boolean): void {
    if (!this.showFullCorrectResponse) this.toggleFullCorrectResponse(show);
  }

  /**
   * The key is shown whether or not the candidate was right.
   *
   * The base withholds it from a correct candidate, on the reasoning that their answer already is
   * the key. That reasoning does not survive contact with this element: asking for the correct
   * response and being shown nothing is indistinguishable from the feature being broken, and it is
   * the only inline interaction where the answer and the key are the same short phrase, so there is
   * no visual clue either. Show it, and let the correctness badge say who was right.
   */
  public override get withholdsFullCorrectResponseWhenCorrect(): boolean {
    return false;
  }

  /** The badge trails the validation message; everything else is the base's. */
  override render() {
    return html`
      ${this.renderTrigger()} ${this.renderMenu()} ${this.renderValidationMessage()}
      <span part=${this.correctionPart} aria-hidden="true"></span>
    `;
  }
}
