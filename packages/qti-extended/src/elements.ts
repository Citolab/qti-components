import { TestBookmark } from './test-bookmark/test-bookmark.js';
import { TestCharacterSheet } from './test-character-sheet/test-character-sheet.js';
import { TestItemLink } from './test-item-link/test-item-link.js';
import { TestPrintContext } from './test-print-context/test-print-context.js';
import { TestPrintVariables } from './test-print-item-variables/test-print-item-variables.js';
import { TestPrintState } from './test-print-state/test-print-state.js';
import { TestScoringButtons } from './test-scoring-buttons/test-scoring-buttons.js';
import { TestScoringFeedback } from './test-scoring-feedback/test-scoring-feedback.js';
import { TestSectionLink } from './test-section-link/test-section-link.js';
import { TestStamp } from './test-stamp/test-stamp.js';
import { TestView } from './test-view-toggle/test-view.js';
import { TestViewToggle } from './test-view-toggle/test-view-toggle.js';
import { TestZoomIn, TestZoomOut, TestZoomReset, zoomElements } from './test-zoom/test-zoom.js';
import { ttsElements } from './tts/elements.js';

export * from './tts/elements.js';

export { bookmarkedItems } from './test-bookmark/test-bookmark.js';
export { formatVariableValue } from './test-print-item-variables/test-print-item-variables.js';
export { zoomElements, zoomLevel } from './test-zoom/test-zoom.js';
export { ttsContext } from './tts/test-item-to-speech.js';
export type { SpeechState } from './tts/test-item-to-speech.js';

export {
  TestBookmark,
  TestCharacterSheet,
  TestItemLink,
  TestPrintContext,
  TestPrintState,
  TestPrintVariables,
  TestScoringButtons,
  TestScoringFeedback,
  TestSectionLink,
  TestStamp,
  TestView,
  TestViewToggle,
  TestZoomIn,
  TestZoomOut,
  TestZoomReset
};

/**
 * The extended plugins' `{ tag, ctor }` pairs, for registering them yourself (in a scoped registry,
 * or next to the correction variants). Defines nothing; `register.ts` and the package root do.
 */
export const qtiExtendedElements = [
  { tag: 'test-bookmark', ctor: TestBookmark },
  { tag: 'test-character-sheet', ctor: TestCharacterSheet },
  { tag: 'test-item-link', ctor: TestItemLink },
  { tag: 'test-print-context', ctor: TestPrintContext },
  { tag: 'test-print-item-variables', ctor: TestPrintVariables },
  { tag: 'test-print-state', ctor: TestPrintState },
  { tag: 'test-scoring-buttons', ctor: TestScoringButtons },
  { tag: 'test-scoring-feedback', ctor: TestScoringFeedback },
  { tag: 'test-section-link', ctor: TestSectionLink },
  { tag: 'test-stamp', ctor: TestStamp },
  { tag: 'test-view', ctor: TestView },
  { tag: 'test-view-toggle', ctor: TestViewToggle },
  ...zoomElements,
  ...ttsElements
] as const;
