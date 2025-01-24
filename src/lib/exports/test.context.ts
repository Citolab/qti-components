import { createContext } from '@lit/context';

import type { ItemContext } from './item.context';
import type { VariableDeclaration } from './variables';

export interface TestContext {
  items: (ItemContext & { category?: string })[];
  testOutcomeVariables?: VariableDeclaration<string | string[] | null>[];
}

export const testContext = createContext<Readonly<TestContext>>(Symbol('testContext'));
