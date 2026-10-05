/**
 * Everything a host needs to persist to resume a candidate's test session, and nothing else.
 *
 * Read it from `qtiTest.state` or the `qti-state-changed` event, store it wherever you like —
 * a database, `localStorage`, `sessionStorage` — and assign it back to `qtiTest.state` to resume.
 *
 * Deliberately not here:
 * - declaration metadata (`baseType`, `cardinality`, `correctResponse`, `mapping`, …): it comes
 *   from the item XML on every load, and persisting the answer key with the candidate's data is
 *   both bloat and a leak;
 * - `configContext` and `qtiContext`: inputs the host supplies on every load, not session state.
 *   The shuffle `seed` in particular must be passed in again, or the restored order changes;
 * - `view`: a role the host decides, not something the candidate produced;
 * - anything computed — scores per section, `done`, `active` — which is rederived from this.
 */
export interface QtiTestState {
  /** Bumped on any incompatible change to this shape. A state with another version is ignored. */
  version: 1;
  test: {
    items: QtiTestStateItem[];
    /** Test-level outcome values. Only outcomes the test declares are restored. */
    outcomes: QtiTestStateValue[];
  };
  session: QtiTestStateSession;
}

export interface QtiTestStateItem {
  /** The `qti-assessment-item-ref` identifier. */
  identifier: string;
  variables: (QtiTestStateValue & { type?: 'response' | 'outcome' | 'template' | 'context' })[];
  /** Opaque per-interaction state keyed by response identifier, e.g. a PCI's `getState()`. */
  state?: Record<string, string | null>;
}

export interface QtiTestStateValue {
  identifier: string;
  value: string | string[] | null;
}

/** Where the candidate is. */
export interface QtiTestStateSession {
  navPartId?: string | null;
  navSectionId?: string | null;
  navItemRefId?: string | null;
}

export const QTI_TEST_STATE_VERSION = 1;
