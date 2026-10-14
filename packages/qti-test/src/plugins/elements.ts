import { TestBookmark } from '../components/test-bookmark/test-bookmark';
import { TestCheckItem } from '../components/test-check-item/test-check-item';
import { TestPagingButtonsStamp } from '../components/test-paging-buttons-stamp/test-paging-buttons-stamp';
import { TestPrintContext } from '../components/test-print-context/test-print-context';
import { TestPrintVariables } from '../components/test-print-item-variables/test-print-item-variables';
import { TestScoringButtons } from '../components/test-scoring-buttons/test-scoring-buttons';
import { TestScoringFeedback } from '../components/test-scoring-feedback/test-scoring-feedback';
import { TestSectionButtonsStamp } from '../components/test-section-buttons-stamp/test-section-buttons-stamp';
import { TestStamp } from '../components/test-stamp/test-stamp';
import { TestView } from '../components/test-view-toggle/test-view';
import { TestViewToggle } from '../components/test-view-toggle/test-view-toggle';
import { ttsElements } from '../tts/elements';

export * from '../tts/elements';

export { bookmarkedItems } from '../components/test-bookmark/test-bookmark';

export {
  TestCheckItem,
  TestBookmark,
  TestPagingButtonsStamp,
  TestPrintContext,
  TestPrintVariables,
  TestScoringButtons,
  TestScoringFeedback,
  TestSectionButtonsStamp,
  TestStamp,
  TestView,
  TestViewToggle
};

/**
 * Every test plugin's elements in one list. `qti-test` registers them with the rest of its
 * elements, and a scoped registry can use the list directly. Defines nothing.
 *
 * A plugin is the set of files listed for it in `plugin-boundary.spec.ts` (`PLUGINS`); this file is
 * the one place that names them all.
 */
export const pluginElements = [
  { tag: 'test-check-item', ctor: TestCheckItem },
  { tag: 'test-bookmark', ctor: TestBookmark },
  { tag: 'test-paging-buttons-stamp', ctor: TestPagingButtonsStamp },
  { tag: 'test-print-context', ctor: TestPrintContext },
  { tag: 'test-print-item-variables', ctor: TestPrintVariables },
  { tag: 'test-scoring-buttons', ctor: TestScoringButtons },
  { tag: 'test-scoring-feedback', ctor: TestScoringFeedback },
  { tag: 'test-section-buttons-stamp', ctor: TestSectionButtonsStamp },
  { tag: 'test-stamp', ctor: TestStamp },
  { tag: 'test-view', ctor: TestView },
  { tag: 'test-view-toggle', ctor: TestViewToggle },
  ...ttsElements
] as const;
