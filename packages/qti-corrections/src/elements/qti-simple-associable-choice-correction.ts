import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import { QtiSimpleAssociableChoice } from '@qti-components/interactions-core/elements/qti-simple-associable-choice';

import { ActiveElementCorrectionMixin } from '../mixins/active-element-correction.mixin';
import { correctionPart } from '../styles/correction.styles';

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
