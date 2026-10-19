import { html, nothing } from 'lit';

import { QtiSimpleChoice } from '@qti-components/interactions-core/elements/qti-simple-choice';

import { ActiveElementCorrectionMixin } from '../mixins/active-element-correction.mixin';
import { correctionPart } from '../styles/correction.styles';

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
