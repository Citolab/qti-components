import type { ItemContext, VariableDeclaration } from '@citolab/qti-components/qti-components';
import { createContext } from '@lit/context';
import { QtiAssessmentTest } from '../qti-assessment-test';

export interface TestContext {
  items: (ItemContext & { category?: string })[];
  testOutcomeVariables: VariableDeclaration<string | string[]>[];
}

export const testContext = createContext<Readonly<TestContext>>(Symbol('test'));

export type TestElement = {
  el: QtiAssessmentTest;
};

export const testElement = createContext<Readonly<TestElement>>(Symbol('testElement'));
