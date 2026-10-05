import { QTI_TEST_STATE_VERSION } from '../types/qti-test-state';

import type { PropertyValues } from 'lit';
import type { SessionContext, TestContext } from '@qti-components/base';
import type { QtiTestState, QtiTestStateSession } from '../types/qti-test-state';
import type { TestBaseInterface } from './test-base';

type Constructor<T = {}> = abstract new (...args: any[]) => T;
type Value = string | string[] | null;

declare global {
  interface GlobalEventHandlersEventMap {
    'qti-state-changed': CustomEvent<QtiTestState>;
  }
}

export interface ITestStateMixin {
  /**
   * The candidate's persistable state: what they answered and where they are.
   *
   * Assign a stored state to resume. It may be assigned at any time: before the test document
   * has loaded it is held and applied as soon as the test connects — before the first item
   * loads, so items and the initial navigation start from it — and after that it is applied
   * immediately and the test navigates to the restored position.
   */
  state: QtiTestState;
}

const copy = (value: Readonly<Value> | undefined): Value =>
  Array.isArray(value) ? [...value] : ((value as string | null | undefined) ?? null);

const isQtiTestState = (value: unknown): value is QtiTestState => {
  const state = value as QtiTestState | null;
  return (
    state?.version === QTI_TEST_STATE_VERSION &&
    Array.isArray(state.test?.items) &&
    Array.isArray(state.test?.outcomes) &&
    typeof state.session === 'object' &&
    state.session !== null
  );
};

const toState = (test: Readonly<TestContext>, session: Readonly<SessionContext>): QtiTestState => ({
  version: QTI_TEST_STATE_VERSION,
  test: {
    items: (test?.items ?? [])
      .filter(item => item.identifier)
      .map(item => ({
        identifier: item.identifier,
        variables: (item.variables ?? []).map(v => ({
          identifier: v.identifier,
          ...(v.type ? { type: v.type } : {}),
          value: copy(v.value)
        })),
        ...(item.state ? { state: { ...item.state } } : {})
      })),
    outcomes: (test?.testOutcomeVariables ?? []).map(v => ({ identifier: v.identifier, value: copy(v.value) }))
  },
  session: {
    ...(session?.navPartId !== undefined ? { navPartId: session.navPartId } : {}),
    ...(session?.navSectionId !== undefined ? { navSectionId: session.navSectionId } : {}),
    ...(session?.navItemRefId !== undefined ? { navItemRefId: session.navItemRefId } : {})
  }
});

/**
 * Persist and resume a test session through one value, `state`, and one event,
 * `qti-state-changed`.
 *
 * Sits directly on top of `TestBaseMixin`, so its `qti-assessment-test-connected` listener runs
 * after the base has built `testContext.items` from the item-refs, and before the navigation
 * mixin's listener picks the first item to load.
 */
export const TestStateMixin = <T extends Constructor<TestBaseInterface>>(superClass: T) => {
  abstract class TestStateClass extends superClass implements ITestStateMixin {
    /** A state assigned before the test connected, applied when it does. */
    #pending: QtiTestState | null = null;

    /**
     * False while a test document is loading. Loading resets both contexts and rebuilds them, so
     * the intermediate states are empty — emitting one would invite a host to save it over the
     * real one.
     */
    #ready = false;

    #lastEmitted: string | null = null;

    constructor(...args: any[]) {
      super(...args);
      this.addEventListener('qti-testdoc-loaded', () => {
        this.#ready = false;
        this.#lastEmitted = null;
      });
      this.addEventListener('qti-assessment-test-connected', () => {
        if (this.#pending) {
          this.#apply(this.#pending);
          this.#pending = null;
        }
        this.#ready = true;
      });
    }

    get state(): QtiTestState {
      return toState(this.testContext, this.sessionContext);
    }

    set state(value: QtiTestState) {
      if (!isQtiTestState(value)) {
        console.warn(`[qti-test] Ignoring a state that is not a version ${QTI_TEST_STATE_VERSION} QtiTestState.`);
        return;
      }
      if (!this.#ready) {
        this.#pending = value;
        return;
      }

      const { navItemRefId, navSectionId } = this.sessionContext;
      this.#apply(value);

      const restored = this.sessionContext;
      if (restored.navItemRefId && restored.navItemRefId !== navItemRefId) {
        this.#requestNavigation('item', restored.navItemRefId);
      } else if (!restored.navItemRefId && restored.navSectionId && restored.navSectionId !== navSectionId) {
        this.#requestNavigation('section', restored.navSectionId);
      }
    }

    protected override updated(changed: PropertyValues): void {
      super.updated(changed);
      if (!this.#ready || !(changed.has('testContext') || changed.has('sessionContext'))) return;

      const state = this.state;
      const serialized = JSON.stringify(state);
      if (serialized === this.#lastEmitted) return;
      this.#lastEmitted = serialized;
      this.dispatchEvent(new CustomEvent('qti-state-changed', { detail: state, bubbles: true, composed: true }));
    }

    #apply(state: QtiTestState): void {
      // Before the items load this only fills the test context; items already on screen are
      // updated too.
      for (const saved of state.test.items) this.updateItemVariables(saved.identifier, saved.variables, saved.state);

      const savedOutcomes = new Map(state.test.outcomes.map(outcome => [outcome.identifier, outcome.value]));
      this.testContext = {
        ...this.testContext,
        testOutcomeVariables: this.testContext.testOutcomeVariables?.map(v =>
          savedOutcomes.has(v.identifier) ? { ...v, value: copy(savedOutcomes.get(v.identifier)) } : v
        )
      };

      // Written before any navigation request, so the linear-mode restriction — which compares
      // against the current position — sees the restored item as current and lets it load.
      this.sessionContext = { ...this.sessionContext, ...this.#validSession(state.session) };
    }

    /** A stored position may point at an item or section a revised test no longer has. */
    #validSession(session: QtiTestStateSession): QtiTestStateSession {
      const exists = (selector: string, id: string | null | undefined) =>
        !!id && !!this._testElement?.querySelector(`${selector}[identifier="${CSS.escape(id)}"]`);
      return {
        ...(exists('qti-test-part', session.navPartId) ? { navPartId: session.navPartId } : {}),
        ...(exists('qti-assessment-section', session.navSectionId) ? { navSectionId: session.navSectionId } : {}),
        ...(this.testContext.items.some(i => i.identifier === session.navItemRefId)
          ? { navItemRefId: session.navItemRefId }
          : {})
      };
    }

    #requestNavigation(type: 'item' | 'section', id: string): void {
      this.dispatchEvent(
        new CustomEvent('qti-request-navigation', { detail: { type, id }, bubbles: true, composed: true })
      );
    }
  }

  return TestStateClass as Constructor<ITestStateMixin> & T;
};
