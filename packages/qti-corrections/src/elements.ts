import { ItemCorrectResponseMode } from './components/item-correct-response-mode/item-correct-response-mode';
import { ItemShowCandidateCorrection } from './components/item-show-candidate-correction/item-show-candidate-correction';
import { ItemShowCorrectResponse } from './components/item-show-correct-response/item-show-correct-response';
import { TestShowCorrectResponse } from './components/test-show-correct-response/test-show-correct-response';
import {
  QtiGapTextCorrection,
  QtiHotspotChoiceCorrection,
  QtiHottextCorrection,
  QtiSimpleAssociableChoiceCorrection,
  QtiSimpleChoiceCorrection
} from './elements/index';
import {
  QtiAssociateInteractionCorrection,
  QtiChoiceInteractionCorrection,
  QtiGapMatchInteractionCorrection,
  QtiGraphicAssociateInteractionCorrection,
  QtiGraphicGapMatchInteractionCorrection,
  QtiGraphicOrderInteractionCorrection,
  QtiHotspotInteractionCorrection,
  QtiHottextInteractionCorrection,
  QtiInlineChoiceInteractionCorrection,
  QtiMatchInteractionCorrection,
  QtiOrderInteractionCorrection,
  QtiPortableCustomInteractionCorrection,
  QtiSelectPointInteractionCorrection,
  QtiSliderInteractionCorrection,
  QtiTextEntryInteractionCorrection
} from './interactions';
import { QtiAssessmentItemCorrection } from './components/qti-assessment-item-correction';
import { QtiItemCorrection } from './components/qti-item-correction';
import {
  QtiTestCorrection,
  TestCheckItemCorrection,
  TestNavigationCorrection
} from './components/test-correction-elements';

/** Correction constructors keyed by their standard QTI tag names. */
export const qtiCorrectionElements = [
  { tag: 'item-correct-response-mode', ctor: ItemCorrectResponseMode },
  { tag: 'item-show-candidate-correction', ctor: ItemShowCandidateCorrection },
  { tag: 'item-show-correct-response', ctor: ItemShowCorrectResponse },
  { tag: 'test-show-correct-response', ctor: TestShowCorrectResponse },
  { tag: 'test-check-item', ctor: TestCheckItemCorrection },
  { tag: 'test-navigation', ctor: TestNavigationCorrection },
  { tag: 'qti-assessment-item', ctor: QtiAssessmentItemCorrection },
  { tag: 'qti-associate-interaction', ctor: QtiAssociateInteractionCorrection },
  { tag: 'qti-choice-interaction', ctor: QtiChoiceInteractionCorrection },
  { tag: 'qti-gap-text', ctor: QtiGapTextCorrection },
  { tag: 'qti-gap-match-interaction', ctor: QtiGapMatchInteractionCorrection },
  { tag: 'qti-graphic-associate-interaction', ctor: QtiGraphicAssociateInteractionCorrection },
  { tag: 'qti-graphic-gap-match-interaction', ctor: QtiGraphicGapMatchInteractionCorrection },
  { tag: 'qti-graphic-order-interaction', ctor: QtiGraphicOrderInteractionCorrection },
  { tag: 'qti-hotspot-interaction', ctor: QtiHotspotInteractionCorrection },
  { tag: 'qti-hotspot-choice', ctor: QtiHotspotChoiceCorrection },
  { tag: 'qti-hottext-interaction', ctor: QtiHottextInteractionCorrection },
  { tag: 'qti-hottext', ctor: QtiHottextCorrection },
  { tag: 'qti-inline-choice-interaction', ctor: QtiInlineChoiceInteractionCorrection },
  { tag: 'qti-item', ctor: QtiItemCorrection },
  { tag: 'qti-test', ctor: QtiTestCorrection },
  { tag: 'qti-match-interaction', ctor: QtiMatchInteractionCorrection },
  { tag: 'qti-order-interaction', ctor: QtiOrderInteractionCorrection },
  { tag: 'qti-portable-custom-interaction', ctor: QtiPortableCustomInteractionCorrection },
  { tag: 'qti-select-point-interaction', ctor: QtiSelectPointInteractionCorrection },
  { tag: 'qti-simple-associable-choice', ctor: QtiSimpleAssociableChoiceCorrection },
  { tag: 'qti-simple-choice', ctor: QtiSimpleChoiceCorrection },
  { tag: 'qti-slider-interaction', ctor: QtiSliderInteractionCorrection },
  { tag: 'qti-text-entry-interaction', ctor: QtiTextEntryInteractionCorrection }
] as const;
