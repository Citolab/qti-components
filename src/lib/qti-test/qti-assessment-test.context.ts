import { createContext } from '@lit-labs/context';
import { ItemContext } from '../qti-components/qti-assessment-item/qti-assessment-item.context';
import { QtiAssessmentItem } from '../qti-components';

interface ItemInfo {
  href: string;
}
export interface TestContext {
  itemIndex: number | null;
  items: (ItemContext & ItemInfo)[];
}

export const testContext = createContext<TestContext>('test');
