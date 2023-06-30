import { createContext } from '@lit-labs/context';

export interface Logger {
  view: 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor';
  log: (msg: string) => void;
}

export const loggerContext = createContext<Logger>('logger');
