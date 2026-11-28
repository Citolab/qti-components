import { QTI_TEST_STATE_VERSION } from '../types/qti-test-state';
import { dispatchPublic, listenPublic } from '../public-events';
import { stateFromContexts } from '../state-from-contexts';

import type { PropertyValues } from 'lit';
import type { StateRefusal } from '../public-events';
import type { QtiTestState, QtiTestStateSession } from '../types/qti-test-state';
import type { TestBaseInterface } from './test-base';

type Constructor<T = {}> = abstract new (...args: any[]) => T;
type Value = string | string[] | null;

export interface ITestStateMixin {
  /**
   * The candidate's persistable state: what they answered and where they are.
   *
   * Assign a stored state to resume. It may be assigned at any time: before the test document
   * has loaded it is held and applied as soon as the test connects — before the first item
   * loads, so items and the initial navigation start from it — and after that it is applied
   * immediately and the test navigates to the restored position.
   *
   * Items are matched by item-ref identifier; items the state does not mention start fresh, and
   * stored items, test outcomes or a position the test no longer has are ignored. Restoring is a
   * resume, so linear-mode navigation restrictions do not apply.
   *
   * A value that is not a version 1 `QtiTestState` is ignored and reported with
   * `qc-test-state-refused`: at once when the test has loaded, or when it does if it was assigned
   * before. A state assigned earlier that could be read stays in effect. A stored 9.x
   * `testContext` is turned into a state with `stateFromContexts`.
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

/**
 * Persist and resume a test session through one value, `state`, and one event,
 * `qc-test-state-changed`.
 *
 * Sits directly on top of `TestBaseMixin`, so its `qc-test-loaded` listener runs
 * after the base has built `testContext.items` from the item-refs, and before the navigation
 * mixin's listener picks the first item to load.
 */
export const TestStateMixin = <T extends Constructor<TestBaseInterface>>(superClass: T) => {
  abstract class TestStateClass extends superClass implements ITestStateMixin {
    /** A state assigned before the test connected, applied when it does. */
    #pending: QtiTestState | null = null;

    /** A refused state assigned before the test connected, reported when it does. */
    #refused: StateRefusal | null = null;

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
      listenPublic(this, 'qc-test-update-plugin-state', ({ detail }) => this.#updatePluginState(detail));
      listenPublic(this, 'qc-test-loaded', () => {
        if (this.#pending) {
          this.#apply(this.#pending);
          this.#pending = null;
        }
        this.#ready = true;
        if (this.#refused) {
          dispatchPublic(this, 'qc-test-state-refused', this.#refused);
          this.#refused = null;
        }
      });
    }

    /** One plugin's entry, as JSON: the test stores it without reading it. `null` removes it. */
    #updatePluginState({ plugin, value }: { plugin: string; value: unknown }): void {
      if (typeof plugin !== 'string' || plugin === '') return;
      const { [plugin]: _removed, ...others } = this.sessionContext.plugins ?? {};
      let next: Record<string, unknown> = others;
      if (value !== null && value !== undefined) {
        try {
          next = { ...others, [plugin]: JSON.parse(JSON.stringify(value)) };
        } catch {
          console.warn(`[qti-test] Ignoring plugin state for "${plugin}": it is not JSON.`);
          return;
        }
      }
      this.sessionContext = { ...this.sessionContext, plugins: next };
    }

    get state(): QtiTestState {
      return stateFromContexts(this.testContext, this.sessionContext);
    }

    set state(value: QtiTestState) {
      if (!isQtiTestState(value)) {
        const message = `Ignoring a state that is not a version ${QTI_TEST_STATE_VERSION} QtiTestState.`;
        console.warn(`[qti-test] ${message}`);
        // Hosts assign state before the test is in the page, where an event reaches no listener.
        if (this.#ready) dispatchPublic(this, 'qc-test-state-refused', { message, state: value });
        else this.#refused = { message, state: value };
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
      dispatchPublic(this, 'qc-test-state-changed', state);
    }

    #apply(state: QtiTestState): void {
      // Before the items load this only fills the test context; items already on screen are
      // updated too.
      for (const saved of state.test.items) this.updateItemVariables(saved.identifier, saved.variables, saved.state);
      this.#warnLeftOut(state);

      const savedOutcomes = new Map(state.test.outcomes.map(outcome => [outcome.identifier, outcome.value]));
      this.testContext = {
        ...this.testContext,
        testOutcomeVariables: this.testContext.testOutcomeVariables?.map(v =>
          savedOutcomes.has(v.identifier) ? { ...v, value: copy(savedOutcomes.get(v.identifier)) } : v
        )
      };

      // Written before any navigation request, so the linear-mode restriction — which compares
      // against the current position — sees the restored item as current and lets it load.
      // Plugins are replaced, not merged: a state without them clears what an earlier one left.
      this.sessionContext = {
        ...this.sessionContext,
        ...this.#validSession(state.session),
        plugins: state.session.plugins && typeof state.session.plugins === 'object' ? { ...state.session.plugins } : {}
      };
    }

    /**
     * Answers for items this test does not present are not restored, and the next state leaves them
     * out: a selection (`qti-selection`) that leaves an item out, or a revised test. Said, not silent
     * (roadmap 1 T4, `plans/host-api.md` → Decided).
     */
    #warnLeftOut(state: QtiTestState): void {
      const presented = new Set(this.testContext.items.map(item => item.identifier));
      const leftOut = state.test.items.map(item => item.identifier).filter(identifier => !presented.has(identifier));
      if (leftOut.length === 0) return;
      console.warn(
        `[qti-test] The state has answers for items this test does not present (not selected, or no longer in it); they are not restored: ${leftOut.join(', ')}.`
      );
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
      dispatchPublic(this, 'qc-test-navigate', { type, id });
    }
  }

  return TestStateClass as Constructor<ITestStateMixin> & T;
};
