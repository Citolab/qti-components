import { html, nothing } from 'lit';

import { QtiSimpleChoice } from '@qti-components/interactions-core/elements/qti-simple-choice';

import { ActiveElementCorrectionMixin } from '../mixins/active-element-correction.mixin';
import { correctionPart } from '../styles/correction.styles';

/**
 * `qti-simple-choice` with a verdict badge after its label; the verdict states come from `ActiveElementCorrectionMixin`.
 *
 * @cssstate candidate-correct - The candidate's answer on this element is correct.
 * @cssstate candidate-incorrect - The candidate's answer on this element is incorrect.
 * @cssstate candidate-partial - The candidate's answer on this element is partially correct (alias `candidate-partially-correct`, one major).
 * @cssstate answer-key - This element is part of the correct response (alias `correct-response`, one major).
 * @csspart correction - The verdict badge; its second token is the verdict state (`candidate-correct`, `candidate-incorrect`, `candidate-partial`), followed by the old `correction-<verdict>` token for one major.
 */
export class QtiSimpleChoiceCorrection extends ActiveElementCorrectionMixin(QtiSimpleChoice) {
  static override styles = [QtiSimpleChoice.styles, correctionPart];

  // Same template as QtiSimpleChoice plus the badge. No tabindex on the control: the choice takes
  // focus on its host, and a focusable control made every choice two Tab stops.
  override render() {
    return html`<div part="control"><div part="control-mark"></div></div>
      ${this.marker ? html`<div id="label" part="marker">${this.marker}</div>` : nothing}
      <slot part="label"></slot>
      <span part=${this.correctionPart} aria-hidden="true"></span>`;
  }
}
