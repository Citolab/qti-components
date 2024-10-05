import type { VariableDeclaration, VariableValue } from '@citolab/qti-components/qti-components';
import { createContext } from '@lit/context';

export interface ItemVariables {
  category?: string;
  href: string;
  identifier: string;
  variables: ReadonlyArray<VariableValue<string | string[] | null>>;
}

export class TestContext {
  items: ItemVariables[];
  testOutcomeVariables: ReadonlyArray<VariableDeclaration<string | string[]>>;
}

export const testContext = createContext<TestContext>('test');
