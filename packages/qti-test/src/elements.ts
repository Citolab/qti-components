import { QtiAssessmentItemRef } from './components/qti-assessment-item-ref/qti-assessment-item-ref';
import { QtiAssessmentSection } from './components/qti-assessment-section/qti-assessment-section';
import { QtiAssessmentTest } from './components/qti-assessment-test/qti-assessment-test';
import { QtiBranchRule } from './components/qti-branch-rule/qti-branch-rule';
import { QtiItemSessionControl } from './components/qti-item-session-control/qti-item-session-control';
import { QtiNumberSelected } from './components/qti-number-selected/qti-number-selected';
import { QtiPreCondition } from './components/qti-pre-condition/qti-pre-condition';
import { QtiOutcomeProcessing } from './components/qti-outcome-processing/qti-outcome-processing';
import { QtiTestFeedback } from './components/qti-test-feedback/qti-test-feedback';
import { QtiTestPart } from './components/qti-test-part/qti-test-part';
import { QtiTestVariables } from './components/qti-test-variables/qti-test-variables';
import { QtiTest } from './components/qti-test/qti-test';
import { TestContainer } from './components/test-container/test-container';
import { TestEndAttempt } from './components/test-end-attempt/test-end-attempt';
import { TestItemLink } from './components/test-item-link/test-item-link';
import { TestNavigation } from './components/test-navigation/test-navigation';
import { TestNext } from './components/test-next/test-next';
import { TestPrev } from './components/test-prev/test-prev';
import { TestSectionLink } from './components/test-section-link/test-section-link';
import { pluginElements } from './plugins/elements';

export * from './plugins/elements';

export {
  QtiAssessmentItemRef,
  QtiAssessmentSection,
  QtiAssessmentTest,
  QtiBranchRule,
  QtiItemSessionControl,
  QtiNumberSelected,
  QtiOutcomeProcessing,
  QtiPreCondition,
  QtiTest,
  QtiTestFeedback,
  QtiTestPart,
  QtiTestVariables,
  TestContainer,
  TestEndAttempt,
  TestItemLink,
  TestNavigation,
  TestNext,
  TestPrev,
  TestSectionLink
};

export const qtiTestElements = [
  { tag: 'qti-assessment-item-ref', ctor: QtiAssessmentItemRef },
  { tag: 'qti-assessment-section', ctor: QtiAssessmentSection },
  { tag: 'qti-assessment-test', ctor: QtiAssessmentTest },
  { tag: 'qti-branch-rule', ctor: QtiBranchRule },
  { tag: 'qti-item-session-control', ctor: QtiItemSessionControl },
  { tag: 'qti-number-selected', ctor: QtiNumberSelected },
  { tag: 'qti-outcome-processing', ctor: QtiOutcomeProcessing },
  { tag: 'qti-pre-condition', ctor: QtiPreCondition },
  { tag: 'qti-test', ctor: QtiTest },
  { tag: 'qti-test-feedback', ctor: QtiTestFeedback },
  { tag: 'qti-test-part', ctor: QtiTestPart },
  { tag: 'qti-test-variables', ctor: QtiTestVariables },
  { tag: 'test-container', ctor: TestContainer },
  { tag: 'test-end-attempt', ctor: TestEndAttempt },
  { tag: 'test-item-link', ctor: TestItemLink },
  { tag: 'test-navigation', ctor: TestNavigation },
  { tag: 'test-next', ctor: TestNext },
  { tag: 'test-prev', ctor: TestPrev },
  { tag: 'test-section-link', ctor: TestSectionLink },
  ...pluginElements
] as const;
