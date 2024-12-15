import { createContext } from '@lit/context';
import { QtiAssessmentTest } from '../qti-assessment-test';
import { ItemContext, VariableDeclaration } from '../../qti-components';

export interface TestContext {
  items: (ItemContext & { category?: string })[];
  testOutcomeVariables: VariableDeclaration<string | string[]>[];
}

export const testContext = createContext<Readonly<TestContext>>(Symbol('test'));

export type TestElement = {
  el: QtiAssessmentTest;
};

export const testElement = createContext<Readonly<TestElement>>(Symbol('testElement'));
