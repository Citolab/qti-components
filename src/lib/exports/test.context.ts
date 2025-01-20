import { createContext } from '@lit/context';

import type { QtiAssessmentTest } from '../qti-test/core';
import type { ItemContext } from './item.context';
import type { VariableDeclaration } from './variables';
import type { View } from '../qti-test/core/mixins/test-view.mixin';

export interface TestContext {
  items: (ItemContext & { category?: string })[];
  testOutcomeVariables: VariableDeclaration<string | string[] | null>[];
  navPartId?: string | null;
  navSectionId?: string | null;
  navItemId?: string | null;
  navItemLoading?: boolean;
  navTestLoading?: boolean;
  view?: View;
}

export const testContext = createContext<Readonly<TestContext>>(Symbol('test'));

export type TestElement = QtiAssessmentTest | null;

export const testElement = createContext<Readonly<TestElement>>(Symbol('testElement'));
