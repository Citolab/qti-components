import { TestScoringButtons } from './test-scoring-buttons';
import { TestScoringFeedback } from './test-scoring-feedback';

export { TestScoringButtons, TestScoringFeedback };

/** The scoring elements, for registering them yourself (e.g. in a scoped registry). Defines nothing. */
export const scoringElements = [
  { tag: 'test-scoring-buttons', ctor: TestScoringButtons },
  { tag: 'test-scoring-feedback', ctor: TestScoringFeedback }
] as const;
