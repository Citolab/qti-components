import type { ItemContext, VariableDeclaration } from '@citolab/qti-components/qti-components';
import { createContext } from '@lit/context';

export interface ItemExtContext extends ItemContext {
  category: string;
}

export class TestContext {
  items: ItemExtContext[];
  testOutcomeVariables: ReadonlyArray<VariableDeclaration<string | string[]>>;
}

export const testContext = createContext<TestContext>('test');
