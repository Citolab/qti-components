import { createContext } from '@lit/context';
import type { QtiAssessmentTest } from '../qti-assessment-test';
import type { ItemContext, VariableDeclaration } from '../../../qti-components';
import type { View } from '../mixins/test-view.mixin';

export interface TestContext {
  items: (ItemContext & { category?: string })[];
  testOutcomeVariables: VariableDeclaration<string | string[]>[];
  navPartId?: string | null;
  navSectionId?: string | null;
  navItemId?: string | null;
  navItemLoading?: boolean;
  navTestLoading?: boolean;
  view?: View;
}

export const testContext = createContext<Readonly<TestContext>>(Symbol('test'));

export type TestElement = {
  el: QtiAssessmentTest;
};

export const testElement = createContext<Readonly<TestElement>>(Symbol('testElement'));
