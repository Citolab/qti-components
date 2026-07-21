import { Interaction } from '@qti-components/base';

import { CandidateCorrectionMixin } from '../mixins/candidate-correction.mixin';

/**
 * Runtime base for interactions that opt in to correction capabilities.
 *
 * This lives in qti-corrections so packages can choose correction behavior
 * explicitly instead of inheriting it from the generic Interaction base.
 */
export abstract class CorrectableInteractionBase extends CandidateCorrectionMixin(Interaction) {}
