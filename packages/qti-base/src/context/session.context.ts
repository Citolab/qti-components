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
  /**
   * What test plugins keep, by plugin name: JSON the test stores and restores without reading it.
   * Part of the persisted state (`QtiTestState.session.plugins`); written through the
   * `cito-test-update-plugin-state` request.
   */
  plugins?: Readonly<Record<string, unknown>>;
}

export const INITIAL_SESSION_CONTEXT: Readonly<SessionContext> = { view: 'candidate' };

export const sessionContext = createContext<Readonly<SessionContext>>(Symbol('sessionContext'));
