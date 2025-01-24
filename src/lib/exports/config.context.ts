import { createContext } from '@lit/context';

export interface ConfigContext {
  infoItemCategory?: string;
}

export const configContext = createContext<Readonly<ConfigContext>>(Symbol('configContext'));
