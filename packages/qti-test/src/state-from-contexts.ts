import { QTI_TEST_STATE_VERSION } from './types/qti-test-state.js';

import type { QtiTestState, QtiTestStateItem, QtiTestStateValue } from './types/qti-test-state.js';

/** A value as a 9.x host may have stored it: QTI values are strings, but JSON kept numbers as numbers. */
type StoredValue = string | number | boolean | null | undefined | readonly (string | number | boolean)[];

/** A variable as stored: only `identifier`, `value` and `type` are read; declaration metadata is ignored. */
export interface StoredVariable {
  identifier: string;
  value?: StoredValue;
  type?: string;
}

/**
 * A `testContext` as a 9.x host stored it (`qtiTest.testContext` or the `qti-test-context-updated`
 * payload), plain JSON. Fields this does not name, such as an item's `href` or a host's own
 * additions, are ignored.
 */
export interface StoredTestContext {
  items?: readonly {
    identifier?: string;
    variables?: readonly StoredVariable[];
    state?: Readonly<Record<string, string | null>>;
  }[];
  testOutcomeVariables?: readonly StoredVariable[];
}

/** A `sessionContext` as a 9.x host stored it: the position and the plugin entries. */
export interface StoredSessionContext {
  navPartId?: string | null;
  navSectionId?: string | null;
  navItemRefId?: string | null;
  plugins?: Readonly<Record<string, unknown>>;
}

const VARIABLE_TYPES = ['response', 'outcome', 'template', 'context'] as const;

const valueOf = (value: StoredValue): QtiTestStateValue['value'] => {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.map(String);
  return String(value);
};

const variable = ({ identifier, type, value }: StoredVariable): QtiTestStateItem['variables'][number] => ({
  identifier,
  ...(VARIABLE_TYPES.includes(type as (typeof VARIABLE_TYPES)[number])
    ? { type: type as (typeof VARIABLE_TYPES)[number] }
    : {}),
  value: valueOf(value)
});

/**
 * Turns a stored `testContext` and `sessionContext` into a `QtiTestState`, so a host that stored the
 * contexts in 9.x can resume with `qtiTest.state = stateFromContexts(testContext, sessionContext)`.
 * `qtiTest.state` reads the same way from the live contexts.
 *
 * It keeps the values only: each item's variables (identifier, value and `type` when it is one QTI
 * knows) and per-interaction state, the test outcomes, the position and the plugin entries. Values
 * are written as QTI's strings, so a number a host stored as a JSON number (`SCORE: 0`) becomes
 * `'0'`. Declaration metadata (`baseType`, `cardinality`, `correctResponse`, …) is left out, as in
 * every `QtiTestState`. Items without an identifier are skipped.
 *
 * @param testContext The stored test context, plain JSON.
 * @param sessionContext The stored session context, if the host kept one. A host that stored only the
 *   item it was on passes `{ navItemRefId }`.
 */
export const stateFromContexts = (
  testContext: Readonly<StoredTestContext> | null | undefined,
  sessionContext?: Readonly<StoredSessionContext> | null
): QtiTestState => ({
  version: QTI_TEST_STATE_VERSION,
  test: {
    items: (testContext?.items ?? [])
      .filter(item => item?.identifier)
      .map(item => ({
        identifier: item.identifier as string,
        variables: (item.variables ?? []).map(variable),
        ...(item.state ? { state: { ...item.state } } : {})
      })),
    outcomes: (testContext?.testOutcomeVariables ?? []).map(v => ({
      identifier: v.identifier,
      value: valueOf(v.value)
    }))
  },
  session: {
    ...(sessionContext?.plugins && Object.keys(sessionContext.plugins).length > 0
      ? { plugins: { ...sessionContext.plugins } }
      : {}),
    ...(sessionContext?.navPartId !== undefined ? { navPartId: sessionContext.navPartId } : {}),
    ...(sessionContext?.navSectionId !== undefined ? { navSectionId: sessionContext.navSectionId } : {}),
    ...(sessionContext?.navItemRefId !== undefined ? { navItemRefId: sessionContext.navItemRefId } : {})
  }
});
