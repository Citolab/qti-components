import { createContext } from '@lit/context';

export interface ConfigContext {
  infoItemCategory?: string;
  reportValidityAfterScoring?: boolean;
  disableAfterIfMaxChoicesReached?: boolean;
}

export const configContext = createContext<Readonly<ConfigContext>>(Symbol('configContext'));
