import { html, nothing } from 'lit';

import { QtiSimpleChoice } from '@qti-components/interactions-core/elements/qti-simple-choice';

import { ActiveElementCorrectionMixin } from '../mixins/active-element-correction.mixin';
import { correctionPart } from '../styles/correction.styles';

export class QtiSimpleChoiceCorrection extends ActiveElementCorrectionMixin(QtiSimpleChoice) {
  static override styles = [QtiSimpleChoice.styles, correctionPart];

  override render() {
    return html`<div part="control" tabindex="0"><div part="control-mark"></div></div>
      ${this.marker ? html`<div id="label" part="marker">${this.marker}</div>` : nothing}
      <slot part="label"></slot>
      <span part=${this.correctionPart} aria-hidden="true"></span>`;
  }
}
