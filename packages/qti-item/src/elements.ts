import { ItemContainer } from './components/item-container/item-container';
import { ItemPrintVariables } from './components/item-print-variables/item-print-variables';
import { QtiItem } from './components/qti-item/qti-item';

export { ItemContainer, ItemPrintVariables, QtiItem };

export const qtiItemElements = [
  { tag: 'item-container', ctor: ItemContainer },
  { tag: 'item-print-variables', ctor: ItemPrintVariables },
  { tag: 'qti-item', ctor: QtiItem }
] as const;
