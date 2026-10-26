import { property } from 'lit/decorators.js';

import { QtiHotspotChoice } from '@qti-components/interactions-core/elements/qti-hotspot-choice';

import { ActiveElementCorrectionMixin } from '../mixins/active-element-correction.mixin';

import type { PropertyValues } from 'lit';

/**
 * A hotspot choice that carries a verdict and, in graphic-order, its position in the answer key.
 *
 * The position is the attribute `data-order-correct` (a hotspot paints it as a pin in CSS, so it is
 * an attribute, not a state: the theme reads it as `[data-order-correct]`). The property still
 * reflects to its old name `aria-ordercorrectvalue` for one major; `updated()` mirrors it.
 *
 * @cssstate candidate-correct - This hotspot's answer is correct.
 * @cssstate candidate-incorrect - This hotspot's answer is incorrect.
 * @cssstate candidate-partial - This hotspot's answer is partially correct (alias `candidate-partially-correct`, one major).
 * @cssstate answer-key - In a hotspot interaction, this hotspot is part of the correct response (alias `correct-response`, one major).
 */
export class QtiHotspotChoiceCorrection extends ActiveElementCorrectionMixin(QtiHotspotChoice) {
  @property({ attribute: 'aria-ordercorrectvalue', type: Number, reflect: true })
  orderCorrect: number | null = null;

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (!changed.has('orderCorrect')) return;
    if (this.orderCorrect == null) this.removeAttribute('data-order-correct');
    else this.setAttribute('data-order-correct', String(this.orderCorrect));
  }
}
