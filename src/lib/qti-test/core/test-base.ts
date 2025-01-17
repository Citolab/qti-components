import { provide } from '@lit/context';
import { LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import type { TestContext, TestElement } from './context';
import { testContext, testElement } from './context';
import type { QtiAssessmentTest } from './qti-assessment-test';
import type { QtiAssessmentItem } from '../../qti-components/';
import type { VariableValue } from '../../exports/variables';

export abstract class TestBase extends LitElement {
  @state()
  @provide({ context: testContext })
  protected _testContext: Readonly<TestContext> = { items: [], testOutcomeVariables: [] };

  @state()
  @provide({ context: testElement })
  protected testElement: TestElement = null;

  constructor() {
    super();

    /**
     * When the test is connected, the items are updated in the test context.
     * An existing context item is updated with the itemRef properties if nessesary.
     */
    this.addEventListener('qti-assessment-test-connected', (e: CustomEvent<QtiAssessmentTest>) => {
      const qtiAssessmentTest = e.detail;
      this.testElement = qtiAssessmentTest;

      const items = Array.from(qtiAssessmentTest.querySelectorAll('qti-assessment-item-ref')).map(itemRef => {
        // Default this._testContext.items to an empty array if undefined
        const existingItem = (this._testContext.items || []).find(item => item.identifier === itemRef.identifier);

        return {
          ...existingItem, // Spread all existing properties if existingItem is found
          href: existingItem?.href || itemRef.href,
          identifier: existingItem?.identifier || itemRef.identifier,
          category: existingItem?.category || itemRef.category,
          variables: existingItem?.variables || [
            {
              identifier: 'completionStatus',
              value: 'not_attempted',
              type: 'outcome'
            }
          ]
        };
      });

      // Ensure this._testContext exists and update its items property
      this._testContext = { ...this._testContext, items };
    });

    this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<QtiAssessmentItem>) => {
      this._updateItemInTestContext(e.detail);
    });
    this.addEventListener('qti-outcome-changed', e => {
      const assessmentitem = e.composedPath()[0] as QtiAssessmentItem;
      this._updateItemVariablesInTestContext(assessmentitem.identifier, assessmentitem.variables);
    });
  }

  get context(): TestContext {
    return this._testContext;
  }

  // /* restores the context by updating existing items and adding new items from the "contextToRestore" parameter into the "this._context.items" array. */
  set context(testContext: TestContext) {
    if (testContext === null || testContext === undefined) return;
    this._testContext = { ...testContext }; // Clone the context to avoid modifying the original object
    // // append the items that are not yet in the context and replace the ones that are
    testContext.items?.forEach(itemContext => {
      const existingItemContext = this._testContext.items.find(i => i.identifier === itemContext.identifier);
      if (existingItemContext) {
        existingItemContext.variables = itemContext.variables;
      } else {
        this._testContext.items.push(itemContext);
      }
    });
  }

  private _updateItemVariablesInTestContext(
    identifier: string,
    variables: VariableValue<string | string[] | null>[]
  ): void {
    // Update the test context with modified variables for the specified item
    this._testContext = {
      ...this._testContext, // Spread existing test context properties
      items: this._testContext.items.map(itemContext => {
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
    const itemContext = this._testContext.items.find(i => i?.identifier === identifier);

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
