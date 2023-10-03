import { createContext } from '@lit-labs/context';
import { VariableDeclaration } from '../qti-utilities/Variables';
import { QtiAssessmentItem } from './qti-assessment-item';

export interface ItemContext {
  href?: string;
  identifier: string;
  itemEl: QtiAssessmentItem;
  variables: ReadonlyArray<VariableDeclaration<string | string[]>>;
}

export const itemContext = createContext<ItemContext>('item');
