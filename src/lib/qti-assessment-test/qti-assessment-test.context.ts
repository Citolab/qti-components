import { createContext } from '@lit-labs/context';
import { ItemContext } from '../qti-components/qti-assessment-item/qti-assessment-item.context';

export interface TestContext {
  itemIndex: number;
  items: ItemContext[];
}

export const testContext = createContext<TestContext>('test');
