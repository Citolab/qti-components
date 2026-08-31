import { html } from 'lit';

import { QtiGapText } from '@qti-components/interactions-core/elements/qti-gap-text';

import { ActiveElementCorrectionMixin } from '../mixins/active-element-correction.mixin';
import { correctionPart } from '../styles/correction.styles';

export class QtiGapTextCorrection extends ActiveElementCorrectionMixin(QtiGapText) {
  static override styles = [QtiGapText.styles, correctionPart];

  override render() {
    return html`<div part="control"></div>
      <slot part="label"></slot>
      <span part=${this.correctionPart} aria-hidden="true"></span>`;
  }
}
