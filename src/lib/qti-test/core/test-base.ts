import { provide } from '@lit/context';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { INITIAL_TEST_CONTEXT, testContext } from '../../exports/test.context';
import { INITIAL_SESSION_CONTEXT, type SessionContext, sessionContext } from '../../exports/session.context';

import type { QtiAssessmentItem } from '../../qti-components/qti-assessment-item/qti-assessment-item';
import type { QtiAssessmentItemRef } from './qti-assessment-test/qti-assessment-item-ref';
import type { QtiAssessmentTest } from './qti-assessment-test/qti-assessment-test';
import type { ItemContext } from '../../exports/item.context';
import type { TestContext } from '../../exports/test.context';
import type { OutcomeVariable, VariableDeclaration, VariableValue } from '../../exports/variables';

export abstract class TestBase extends LitElement {
  @property({ attribute: false, type: Object })
  @provide({ context: testContext })
  public testContext: Readonly<TestContext> = INITIAL_TEST_CONTEXT;

  @property({ attribute: false, type: Object })
  @provide({ context: sessionContext })
  public sessionContext: Readonly<SessionContext> = INITIAL_SESSION_CONTEXT;

  protected _testElement: QtiAssessmentTest;

  updateItemVariables(itemRefID: string, variables: VariableValue<string | string[] | null>[]): void {
    // Update variables in the testContext for the specified itemRefID
    const itemContext = this.testContext.items.find(item => item.identifier === itemRefID);
    if (itemContext) {
      itemContext.variables = itemContext.variables.map(variable => {
        const updatedVariable = variables.find(v => v.identifier === variable.identifier);
        return updatedVariable ? { ...variable, ...updatedVariable } : variable;
      });
    }
    // if the qti-assessment-item-ref has a qti-assessment-item, then update this item as well
    const itemRef = this._testElement.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${itemRefID}"]`
    );
    if (itemRef && itemRef.assessmentItem) {
      itemRef.assessmentItem.variables = variables;
    }
  }

  constructor() {
    super();

    /**
     * When the test is connected, the items are updated in the test context.
     * An existing context item is updated with the itemRef properties if nessesary.
     */
    this.addEventListener('qti-assessment-test-connected', (e: CustomEvent<QtiAssessmentTest>) => {
      this.testContext = INITIAL_TEST_CONTEXT; // new test, new test context!
      this.sessionContext = INITIAL_SESSION_CONTEXT; // new test, new session context!
      if (this.testContext && this.testContext.items.length > 0) return;

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
      this._updateItemVariablesInTestContext(e.detail.itemContext.identifier, e.detail.itemContext.variables);
    });
  }

  private _updateItemVariablesInTestContext(
    identifier: string,
    variables: readonly VariableDeclaration<string | string[] | null>[]
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
          })
        };
      })
    };
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

    // console.log(this._testContext);
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
    }
  };
}
