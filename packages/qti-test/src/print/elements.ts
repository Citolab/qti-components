import { TestPrintContext } from './test-print-context';
import { TestPrintVariables } from './test-print-item-variables';

export { TestPrintContext, TestPrintVariables };

/** The print elements, for registering them yourself (e.g. in a scoped registry). Defines nothing. */
export const printElements = [
  { tag: 'test-print-context', ctor: TestPrintContext },
  { tag: 'test-print-item-variables', ctor: TestPrintVariables }
] as const;
