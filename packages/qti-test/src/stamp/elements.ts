import { TestPagingButtonsStamp } from './test-paging-buttons-stamp';
import { TestSectionButtonsStamp } from './test-section-buttons-stamp';
import { TestStamp } from './test-stamp';

export { TestPagingButtonsStamp, TestSectionButtonsStamp, TestStamp };

/** The stamp elements, for registering them yourself (e.g. in a scoped registry). Defines nothing. */
export const stampElements = [
  { tag: 'test-paging-buttons-stamp', ctor: TestPagingButtonsStamp },
  { tag: 'test-section-buttons-stamp', ctor: TestSectionButtonsStamp },
  { tag: 'test-stamp', ctor: TestStamp }
] as const;
