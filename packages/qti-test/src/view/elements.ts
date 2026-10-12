import { TestViewToggle } from './test-view-toggle';
import { TestView } from './test-view';
import { TestCheckItem } from './test-check-item';

export { TestViewToggle, TestView, TestCheckItem };

/** The view controls elements, for registering them yourself (e.g. in a scoped registry). Defines nothing. */
export const viewElements = [
  { tag: 'test-check-item', ctor: TestCheckItem },
  { tag: 'test-view', ctor: TestView },
  { tag: 'test-view-toggle', ctor: TestViewToggle }
] as const;
