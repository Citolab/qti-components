import { createContext } from '@lit/context';

export type CorrectResponseMode = 'internal' | 'full';

export interface ConfigContext {
  infoItemCategory?: string;
  reportValidityAfterScoring?: boolean;
  disableAfterIfMaxChoicesReached?: boolean;
  correctResponseMode?: CorrectResponseMode;
}

export const configContext = createContext<Readonly<ConfigContext>>(Symbol('configContext'));
