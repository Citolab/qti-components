import { provide } from '@lit/context';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { INITIAL_TEST_CONTEXT, testContext } from '@qti-components/base';
import { INITIAL_SESSION_CONTEXT, type SessionContext, sessionContext } from '@qti-components/base';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiAssessmentItemRef } from '../components/qti-assessment-item-ref/qti-assessment-item-ref';
import type { QtiAssessmentTest } from '../components/qti-assessment-test/qti-assessment-test';
import type { ConfigContext, QtiContext } from '@qti-components/base';
import type { ItemContext } from '@qti-components/base';
import type { TestContext } from '@qti-components/base';
import type { OutcomeVariable, VariableDeclaration, VariableValue } from '@qti-components/base';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export interface TestBaseInterface extends LitElement {
  testContext: Readonly<TestContext>;
  sessionContext: Readonly<SessionContext>;
  configContext?: Readonly<ConfigContext>;
  /** Provided by `qti-test`. */
  qtiContext?: Readonly<QtiContext>;
  _testElement: QtiAssessmentTest;
  updateItemVariables(itemRefID: string, variables: readonly ItemVariableValue[], state?: ItemContext['state']): void;
}

/** A value to set on an item; `type` is only needed for a variable the item does not declare. */
export type ItemVariableValue = Pick<VariableValue<string | string[] | null>, 'identifier' | 'value'> &
  Partial<Pick<VariableValue<string | string[] | null>, 'type'>>;

export const TestBaseMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  abstract class TestBaseClass extends superClass implements TestBaseInterface {
    @property({ attribute: false, type: Object })
    @provide({ context: testContext })
    public testContext: Readonly<TestContext> = INITIAL_TEST_CONTEXT;

    @property({ attribute: false, type: Object })
    @provide({ context: sessionContext })
    public sessionContext: Readonly<SessionContext> = INITIAL_SESSION_CONTEXT;

    public _testElement: QtiAssessmentTest;

    constructor(...args: any[]) {
      super(...args);
      this._initializeEventListeners();
    }

    /**
     * Sets values on one item from outside the candidate's session, e.g. a score from manual
     * scoring. Values are merged into the item's entry in the test context, and into the item
     * itself if it is on screen; a value the item has not seen yet is added, so this also works
     * before the item has loaded. To restore a whole session, assign `state` instead.
     *
     * The test context is replaced rather than changed in place, so its consumers update and
     * `qti-state-changed` fires.
     *
     * @param itemRefID The `qti-assessment-item-ref` identifier, not the item's own identifier.
     * @param state Opaque per-interaction state keyed by response identifier, e.g. a PCI's `getState()`.
     */
    updateItemVariables(itemRefID: string, values: readonly ItemVariableValue[], state?: ItemContext['state']): void {
      this.testContext = {
        ...this.testContext,
        items: this.testContext.items.map(item => {
          if (item.identifier !== itemRefID) return item;

          const variables = [...(item.variables ?? [])];
          for (const { identifier, type, value } of values) {
            const index = variables.findIndex(v => v.identifier === identifier);
            const updated = {
              ...(index >= 0 ? variables[index] : {}),
              identifier,
              ...(type ? { type } : {}),
              value: Array.isArray(value) ? [...value] : value
            } as VariableDeclaration<string | string[] | null>;
            if (index >= 0) variables[index] = updated;
            else variables.push(updated);
          }
          return { ...item, variables, ...(state ? { state: { ...state } } : {}) };
        })
      };

      const assessmentItem = this._testElement?.querySelector<QtiAssessmentItemRef>(
        `qti-assessment-item-ref[identifier="${CSS.escape(itemRefID)}"]`
      )?.assessmentItem;
      if (!assessmentItem) return;
      assessmentItem.variables = [...(this.testContext.items.find(i => i.identifier === itemRefID)?.variables ?? [])];
      if (state) assessmentItem.state = state;
    }

    private _initializeEventListeners(): void {
      /**
       * A new test document means a new test and session context.
       *
       * This resets on the document being loaded rather than on
       * `qti-assessment-test-connected`, because the new document's children —
       * test-level `qti-outcome-declaration` among them — connect and register
       * themselves into the context *before* the test element announces itself.
       * Resetting on that announcement discarded every one of those
       * registrations, so no test-level outcome could be read or set.
       */
      this.addEventListener('qti-testdoc-loaded', () => {
        this.testContext = INITIAL_TEST_CONTEXT;
        this.sessionContext = INITIAL_SESSION_CONTEXT;
      });

      /**
       * When the test is connected, its item-refs are added to the test context.
       * Registrations from the document's children are already present on the
       * context reset above, so this must preserve what is there.
       */
      this.addEventListener('qti-assessment-test-connected', (e: CustomEvent<QtiAssessmentTest>) => {
        this._testElement = e.detail;
        const items = Array.from(this._testElement.querySelectorAll('qti-assessment-item-ref')).map(itemRef => {
          return {
            href: itemRef.href,
            identifier: itemRef.identifier,
            category: itemRef.category,
            variables: [
              {
                identifier: 'completionStatus',
                value: 'not_attempted',
                type: 'outcome'
              } as OutcomeVariable
            ]
          };
        });
        this.testContext = { ...this.testContext, items };
      });

      this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<QtiAssessmentItem>) => {
        const assessmentItem = e.detail as QtiAssessmentItem;
        const assessmentRefId = assessmentItem.closest('qti-assessment-item-ref')?.identifier;
        if (assessmentRefId) {
          assessmentItem.assessmentItemRefId = assessmentRefId;
        }
        this._updateItemInTestContext(e.detail);
      });

      this.addEventListener('qti-item-context-updated', (e: CustomEvent<{ itemContext: ItemContext }>) => {
        // const assessmentitem = e.composedPath()[0] as QtiAssessmentItem;
        this._updateItemVariablesInTestContext(
          e.detail.itemContext.identifier,
          e.detail.itemContext.variables,
          e.detail.itemContext.state
        );
      });
    }

    private _updateItemVariablesInTestContext(
      identifier: string,
      variables: readonly VariableDeclaration<string | string[] | null>[],
      state?: ItemContext['state']
    ): void {
      // Update the test context with modified variables for the specified item
      this.testContext = {
        ...this.testContext, // Spread existing test context properties
        items: this.testContext.items.map(itemContext => {
          // If the item identifier doesn't match, keep it unchanged
          if (itemContext.identifier !== identifier) {
            return itemContext;
          }

          // Update the matching item with new variables
          return {
            ...itemContext, // Keep other properties of the item context
            variables: variables.map(variable => {
              // Find a matching variable in the current item context
              const matchingVariable = itemContext.variables.find(v => v.identifier === variable.identifier);

              // Merge matching variable with the new one, or use the new variable if no match
              return matchingVariable ? { ...matchingVariable, ...variable } : variable;
            }),
            ...(state !== undefined ? { state: state ? { ...state } : undefined } : {})
          };
        })
      };
      // Deprecated for hosts, see `@event` on `qti-test`; kept until the next major.
      this.dispatchEvent(
        new CustomEvent('qti-test-context-updated', { detail: this.testContext, bubbles: false, composed: false })
      );
    }

    /**
     * Updates the variables of an assessment item in the test context.
     * - Matches the assessment item with the corresponding test context item.
     * - If the item is not found, logs a warning.
     * - Updates variables in the test context if exactly one variable exists.
     * - Otherwise, syncs the assessment item's variables with the test context.
     *
     * @param assessmentItem - The assessment item to update.
     */
    private _updateItemInTestContext = (assessmentItem: QtiAssessmentItem): void => {
      const context = (assessmentItem as any)._context;
      const identifier = context.identifier;
      const fullVariables = context.variables;

      // Find the corresponding item in the test context by identifier
      const itemContext = this.testContext.items.find(i => i?.identifier === identifier);

      if (!itemContext) {
        console.warn(`Item IDs between assessment.xml and item.xml should match: ${identifier} is not found!`);
        return;
      }

      // Update variables in the test context or sync them to the assessment item
      if (itemContext.variables?.length === 1) {
        // The loaded qti-assessment-item itself has variables which are not in test context yet.
        this._updateItemVariablesInTestContext(identifier, fullVariables);
      } else {
        const newVariables = [...assessmentItem.variables];
        // Sync the assessment item's variables with the test context
        for (const variable of itemContext.variables) {
          const currentVariable = newVariables.find(v => v.identifier === variable.identifier);
          if (currentVariable) {
            currentVariable.value = variable.value;
          } else {
            newVariables.push(variable);
          }
        }
        assessmentItem.variables = newVariables;
        // Opaque interaction state (a PCI's getState()) is read from the item context when the
        // interaction initializes, so it has to be in place now, before that happens.
        if (itemContext.state) {
          assessmentItem.state = itemContext.state;
        }
      }
    };
  }

  return TestBaseClass as Constructor<TestBaseInterface> & T;
};

// Keep the old abstract class for backwards compatibility during migration
export abstract class TestBase extends TestBaseMixin(LitElement) {}
