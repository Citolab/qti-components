import { html } from 'lit';

import { QtiHottext } from '@qti-components/interactions-core/elements/qti-hottext';

import { ActiveElementCorrectionMixin } from '../mixins/active-element-correction.mixin';
import { correctionPart } from '../styles/correction.styles';

export class QtiHottextCorrection extends ActiveElementCorrectionMixin(QtiHottext) {
  static override styles = [QtiHottext.styles, correctionPart];

  override render() {
    return html`<div part="control"><div part="control-mark"></div></div>
      <slot part="label"></slot>
      <span part=${this.correctionPart} aria-hidden="true"></span>`;
  }
}
