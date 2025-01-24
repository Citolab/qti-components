import { provide } from '@lit/context';
import { LitElement } from 'lit';
import { state } from 'lit/decorators.js';

import { testContext } from '../../exports/test.context';
import { type SessionContext, sessionContext } from '../../exports/session.context';

import type { TestContext } from '../../exports/test.context';
import type { QtiAssessmentTest } from './qti-assessment-test';
import type { QtiAssessmentItem } from '../../qti-components/';
import type { OutcomeVariable, VariableValue } from '../../exports/variables';

export abstract class TestBase extends LitElement {
  @state()
  @provide({ context: testContext })
  public testContext: Readonly<TestContext> = { items: [], testOutcomeVariables: [] };

  @state()
  @provide({ context: sessionContext })
  public sessionContext: Readonly<SessionContext> = {};

  testElement: QtiAssessmentTest;

  constructor() {
    super();

    /**
     * When the test is connected, the items are updated in the test context.
     * An existing context item is updated with the itemRef properties if nessesary.
     */
    this.addEventListener('qti-assessment-test-connected', (e: CustomEvent<QtiAssessmentTest>) => {
      if (this.testContext && this.testContext.items.length > 0) return;

      this.testElement = e.detail;
      const items = Array.from(this.testElement.querySelectorAll('qti-assessment-item-ref')).map(itemRef => {
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
      this._updateItemInTestContext(e.detail);
    });
    this.addEventListener('qti-outcome-changed', e => {
      const assessmentitem = e.composedPath()[0] as QtiAssessmentItem;
      this._updateItemVariablesInTestContext(assessmentitem.identifier, assessmentitem.variables);
    });
  }

  // get testContext(): TestContext {
  //   return this._testContext;
  // }

  // // /* restores the context by updating existing items and adding new items from the "contextToRestore" parameter into the "this._context.items" array. */
  // set testContext(testContext: TestContext) {
  //   if (this._testContext.items.length > 0) {
  //     console.warn(
  //       'testContext already set and can not be overwritten. Set the testContext before loading the assessment test'
  //     );
  //     return;
  //   }
  //   if (testContext === null || testContext === undefined) return;
  //   this._testContext = { ...testContext }; // Clone the context to avoid modifying the original object
  //   // // append the items that are not yet in the context and replace the ones that are
  //   testContext.items?.forEach(itemContext => {
  //     const existingItemContext = this._testContext.items.find(i => i.identifier === itemContext.identifier);
  //     if (existingItemContext) {
  //       existingItemContext.variables = itemContext.variables;
  //     } else {
  //       this._testContext.items.push(itemContext);
  //     }
  //   });
  // }

  private _updateItemVariablesInTestContext(
    identifier: string,
    variables: VariableValue<string | string[] | null>[]
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
    const { identifier, variables } = assessmentItem;

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
      this._updateItemVariablesInTestContext(identifier, variables);
    } else {
      // Sync the assessment item's variables with the test context
      assessmentItem.variables = [...(itemContext.variables || [])];
    }
  };
}
