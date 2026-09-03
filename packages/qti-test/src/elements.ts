import { QtiAssessmentItemRef } from './components/qti-assessment-item-ref/qti-assessment-item-ref';
import { QtiAssessmentSection } from './components/qti-assessment-section/qti-assessment-section';
import { QtiAssessmentTest } from './components/qti-assessment-test/qti-assessment-test';
import { QtiItemSessionControl } from './components/qti-item-session-control/qti-item-session-control';
import { QtiOutcomeProcessing } from './components/qti-outcome-processing/qti-outcome-processing';
import { QtiTestFeedback } from './components/qti-test-feedback/qti-test-feedback';
import { QtiTestPart } from './components/qti-test-part/qti-test-part';
import { QtiTestVariables } from './components/qti-test-variables/qti-test-variables';
import { QtiTest } from './components/qti-test/qti-test';
import { TestCheckItem } from './components/test-check-item/test-check-item';
import { TestContainer } from './components/test-container/test-container';
import { TestEndAttempt } from './components/test-end-attempt/test-end-attempt';
import { TestItemLink } from './components/test-item-link/test-item-link';
import {
  TestItemToSpeech,
  TestTtsNext,
  TestTtsPause,
  TestTtsPlay,
  TestTtsPrev,
  TestTtsResume,
  TestTtsStop
} from './components/test-item-to-speech/test-item-to-speech';
import { TestNavigation } from './components/test-navigation/test-navigation';
import { TestNext } from './components/test-next/test-next';
import { TestPagingButtonsStamp } from './components/test-paging-buttons-stamp/test-paging-buttons-stamp';
import { TestPrev } from './components/test-prev/test-prev';
import { TestPrintContext } from './components/test-print-context/test-print-context';
import { TestPrintVariables } from './components/test-print-item-variables/test-print-item-variables';
import { TestScoringButtons } from './components/test-scoring-buttons/test-scoring-buttons';
import { TestScoringFeedback } from './components/test-scoring-feedback/test-scoring-feedback';
import { TestSectionButtonsStamp } from './components/test-section-buttons-stamp/test-section-buttons-stamp';
import { TestSectionLink } from './components/test-section-link/test-section-link';
import { TestStamp } from './components/test-stamp/test-stamp';
import { TestView } from './components/test-view-toggle/test-view';
import { TestViewToggle } from './components/test-view-toggle/test-view-toggle';

export {
  QtiAssessmentItemRef,
  QtiAssessmentSection,
  QtiAssessmentTest,
  QtiItemSessionControl,
  QtiOutcomeProcessing,
  QtiTest,
  QtiTestFeedback,
  QtiTestPart,
  QtiTestVariables,
  TestCheckItem,
  TestContainer,
  TestEndAttempt,
  TestItemLink,
  TestItemToSpeech,
  TestNavigation,
  TestNext,
  TestPagingButtonsStamp,
  TestPrev,
  TestPrintContext,
  TestPrintVariables,
  TestScoringButtons,
  TestScoringFeedback,
  TestSectionButtonsStamp,
  TestSectionLink,
  TestStamp,
  TestTtsNext,
  TestTtsPause,
  TestTtsPlay,
  TestTtsPrev,
  TestTtsResume,
  TestTtsStop,
  TestView,
  TestViewToggle
};

export const qtiTestElements = [
  { tag: 'qti-assessment-item-ref', ctor: QtiAssessmentItemRef },
  { tag: 'qti-assessment-section', ctor: QtiAssessmentSection },
  { tag: 'qti-assessment-test', ctor: QtiAssessmentTest },
  { tag: 'qti-item-session-control', ctor: QtiItemSessionControl },
  { tag: 'qti-outcome-processing', ctor: QtiOutcomeProcessing },
  { tag: 'qti-test', ctor: QtiTest },
  { tag: 'qti-test-feedback', ctor: QtiTestFeedback },
  { tag: 'qti-test-part', ctor: QtiTestPart },
  { tag: 'qti-test-variables', ctor: QtiTestVariables },
  { tag: 'test-check-item', ctor: TestCheckItem },
  { tag: 'test-container', ctor: TestContainer },
  { tag: 'test-end-attempt', ctor: TestEndAttempt },
  { tag: 'test-item-link', ctor: TestItemLink },
  { tag: 'test-item-to-speech', ctor: TestItemToSpeech },
  { tag: 'test-navigation', ctor: TestNavigation },
  { tag: 'test-next', ctor: TestNext },
  { tag: 'test-paging-buttons-stamp', ctor: TestPagingButtonsStamp },
  { tag: 'test-prev', ctor: TestPrev },
  { tag: 'test-print-context', ctor: TestPrintContext },
  { tag: 'test-print-item-variables', ctor: TestPrintVariables },
  { tag: 'test-scoring-buttons', ctor: TestScoringButtons },
  { tag: 'test-scoring-feedback', ctor: TestScoringFeedback },
  { tag: 'test-section-buttons-stamp', ctor: TestSectionButtonsStamp },
  { tag: 'test-section-link', ctor: TestSectionLink },
  { tag: 'test-stamp', ctor: TestStamp },
  { tag: 'test-tts-next', ctor: TestTtsNext },
  { tag: 'test-tts-pause', ctor: TestTtsPause },
  { tag: 'test-tts-play', ctor: TestTtsPlay },
  { tag: 'test-tts-prev', ctor: TestTtsPrev },
  { tag: 'test-tts-resume', ctor: TestTtsResume },
  { tag: 'test-tts-stop', ctor: TestTtsStop },
  { tag: 'test-view', ctor: TestView },
  { tag: 'test-view-toggle', ctor: TestViewToggle }
] as const;
