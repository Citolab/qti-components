import { createContext } from '@lit/context';

export type View = 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor' | '';

export interface SessionContext {
  navPartId?: string | null;
  navSectionId?: string | null;
  navItemRefId?: string | null;
  /** @deprecated Never set by the library. Removed in the next major. */
  navItemLoading?: boolean;
  /** @deprecated Never set by the library. Removed in the next major. */
  navTestLoading?: boolean;
  view?: View;
}

export const INITIAL_SESSION_CONTEXT: Readonly<SessionContext> = { view: 'candidate' };

export const sessionContext = createContext<Readonly<SessionContext>>(Symbol('sessionContext'));
