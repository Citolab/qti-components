import { createContext } from '@lit/context';

export type viewer = 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor' | '';

export class SessionContext {
  identifier: string | null;
  view: viewer;
}

export const sessionContext = createContext<SessionContext>(Symbol('session'));
