import { property } from 'lit/decorators.js';

import { QtiHotspotChoice } from '@qti-components/interactions-core/elements/qti-hotspot-choice';

import { ActiveElementCorrectionMixin } from '../mixins/active-element-correction.mixin';

export class QtiHotspotChoiceCorrection extends ActiveElementCorrectionMixin(QtiHotspotChoice) {
  @property({ attribute: 'aria-ordercorrectvalue', type: Number, reflect: true })
  orderCorrect: number | null = null;
}
