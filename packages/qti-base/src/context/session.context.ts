import { createContext } from '@lit/context';

export type View = 'author' | 'candidate' | 'proctor' | 'scorer' | 'testConstructor' | 'tutor' | '';

export interface SessionContext {
  navPartId?: string | null;
  navSectionId?: string | null;
  navItemRefId?: string | null;
  /** Identifier of the atEnd qti-test-feedback currently on screen, or null/absent otherwise. */
  navFeedbackIdentifier?: string | null;
  navItemLoading?: boolean;
  navTestLoading?: boolean;
  view?: View;
}

export const INITIAL_SESSION_CONTEXT: Readonly<SessionContext> = { view: 'candidate' };

export const sessionContext = createContext<Readonly<SessionContext>>(Symbol('testContext'));
