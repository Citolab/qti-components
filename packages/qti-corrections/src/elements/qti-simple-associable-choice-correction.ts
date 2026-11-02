import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import { QtiSimpleAssociableChoice } from '@qti-components/interactions-core/elements/qti-simple-associable-choice';

import { ActiveElementCorrectionMixin } from '../mixins/active-element-correction.mixin';
import { correctionPart } from '../styles/correction.styles';

/**
 * `qti-simple-associable-choice` with a verdict badge after its label; the verdict states come from `ActiveElementCorrectionMixin`.
 *
 * @cssstate candidate-correct - The candidate's answer on this element is correct.
 * @cssstate candidate-incorrect - The candidate's answer on this element is incorrect.
 * @cssstate candidate-partial - The candidate's answer on this element is partially correct (alias `candidate-partially-correct`, one major).
 * @csspart correction - The verdict badge; its second token is the verdict state (`candidate-correct`, `candidate-incorrect`, `candidate-partial`), followed by the old `correction-<verdict>` token for one major.
 */
export class QtiSimpleAssociableChoiceCorrection extends ActiveElementCorrectionMixin(QtiSimpleAssociableChoice) {
  static override styles = [QtiSimpleAssociableChoice.styles, correctionPart];

  override render() {
    return html`
      <div part="control"></div>
      <slot part="label"></slot>
      <span part=${this.correctionPart} aria-hidden="true"></span>
      <div part="drop">
        ${repeat(
          this.drags,
          node => node.getAttribute('identifier'),
          node => node
        )}
      </div>
    `;
  }
}
