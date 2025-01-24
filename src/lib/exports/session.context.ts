import { createContext } from '@lit/context';

import type { View } from '../qti-test/core/mixins/test-view.mixin';

export interface SessionContext {
  navPartId?: string | null;
  navSectionId?: string | null;
  navItemId?: string | null;
  navItemLoading?: boolean;
  navTestLoading?: boolean;
  view?: View;
}

export const sessionContext = createContext<Readonly<SessionContext>>(Symbol('testContext'));
