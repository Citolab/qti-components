import { QtiAssessmentItem } from './components/qti-assessment-item/qti-assessment-item';
import { QtiAssessmentStimulusRef } from './components/qti-assessment-stimulus-ref/qti-assessment-stimulus-ref';
import { QtiCompanionMaterialsInfo } from './components/qti-companion-materials-info/qti-companion-materials-info';
import { QtiContentBody } from './components/qti-content-body/qti-content-body';
import { QtiContextDeclaration } from './components/qti-context-declaration/qti-context-declaration';
import { QtiCustomOperator } from './components/qti-custom-operator/qti-custom-operator';
import { QtiFeedbackBlock } from './components/qti-feedback-block/qti-feedback-block';
import { QtiFeedbackInline } from './components/qti-feedback-inline/qti-feedback-inline';
import { QtiItemBody } from './components/qti-item-body/qti-item-body';
import { QtiModalFeedback } from './components/qti-modal-feedback/qti-modal-feedback';
import { QtiOutcomeDeclaration } from './components/qti-outcome-declaration/qti-outcome-declaration';
import { QtiResponseDeclaration } from './components/qti-response-declaration/qti-response-declaration';
import { QtiResponseProcessing } from './components/qti-response-processing/qti-response-processing';
import { QtiRubricBlock } from './components/qti-rubric-block/qti-rubric-block';
import { QtiStylesheet } from './components/qti-stylesheet/qti-stylesheet';
import { QtiTemplateConstraint } from './components/qti-template-constraint/qti-template-constraint';
import { QtiTemplateDeclaration } from './components/qti-template-declaration/qti-template-declaration';
import { QtiTemplateProcessing } from './components/qti-template-processing/qti-template-processing';

export {
  QtiAssessmentItem,
  QtiAssessmentStimulusRef,
  QtiCompanionMaterialsInfo,
  QtiContentBody,
  QtiContextDeclaration,
  QtiCustomOperator,
  QtiFeedbackBlock,
  QtiFeedbackInline,
  QtiItemBody,
  QtiModalFeedback,
  QtiOutcomeDeclaration,
  QtiResponseDeclaration,
  QtiResponseProcessing,
  QtiRubricBlock,
  QtiStylesheet,
  QtiTemplateConstraint,
  QtiTemplateDeclaration,
  QtiTemplateProcessing
};

export const qtiContentElements = [
  { tag: 'qti-assessment-item', ctor: QtiAssessmentItem },
  { tag: 'qti-assessment-stimulus-ref', ctor: QtiAssessmentStimulusRef },
  { tag: 'qti-companion-materials-info', ctor: QtiCompanionMaterialsInfo },
  { tag: 'qti-content-body', ctor: QtiContentBody },
  { tag: 'qti-context-declaration', ctor: QtiContextDeclaration },
  { tag: 'qti-custom-operator', ctor: QtiCustomOperator },
  { tag: 'qti-feedback-block', ctor: QtiFeedbackBlock },
  { tag: 'qti-feedback-inline', ctor: QtiFeedbackInline },
  { tag: 'qti-item-body', ctor: QtiItemBody },
  { tag: 'qti-modal-feedback', ctor: QtiModalFeedback },
  { tag: 'qti-outcome-declaration', ctor: QtiOutcomeDeclaration },
  { tag: 'qti-response-declaration', ctor: QtiResponseDeclaration },
  { tag: 'qti-response-processing', ctor: QtiResponseProcessing },
  { tag: 'qti-rubric-block', ctor: QtiRubricBlock },
  { tag: 'qti-stylesheet', ctor: QtiStylesheet },
  { tag: 'qti-template-constraint', ctor: QtiTemplateConstraint },
  { tag: 'qti-template-declaration', ctor: QtiTemplateDeclaration },
  { tag: 'qti-template-processing', ctor: QtiTemplateProcessing }
] as const;
