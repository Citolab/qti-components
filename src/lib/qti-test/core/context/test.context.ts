import { createContext } from '@lit/context';
import type { QtiAssessmentTest } from '../qti-assessment-test';
import type { View } from '../mixins/test-view.mixin';
import type { VariableDeclaration } from '../../../qti-components/internal/variables';
import type { ItemContext } from '../../../qti-components/internal/item.context';

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
