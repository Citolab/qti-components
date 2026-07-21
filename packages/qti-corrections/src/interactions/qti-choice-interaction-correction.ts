import { QtiChoiceInteraction } from '@qti-components/choice-interaction/elements';

import { ChoiceCorrectionMixin } from '../mixins/choice-correction.mixin';

/**
 * Correction-capable `qti-choice-interaction` implementation.
 *
 * It is registered under the standard tag only inside a correction registry;
 * the standard package constructor remains correction-free.
 */
export class QtiChoiceInteractionCorrection extends ChoiceCorrectionMixin(QtiChoiceInteraction) {}
