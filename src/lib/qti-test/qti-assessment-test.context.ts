import { createContext } from '@lit/context';
import { ItemContext } from '../qti-components/qti-assessment-item/qti-assessment-item.context';

interface ItemInfo {
  href: string;
}
export class TestContext {
  itemIndex: number | null;
  items: ItemContext[];
}

export const testContext = createContext<TestContext>('test');
