import { createContext } from '@lit-labs/context';

export interface Logger {
  view: string;
  log: (msg: string) => void;
}

export const loggerContext = createContext<Logger>('logger');
