import { property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { QtiExpression } from '@qti-components/shared';
import { itemContext } from '@qti-components/shared';
import { testContext } from '@qti-components/shared';

import type { ItemContext } from '@qti-components/shared';
import type { TestContext } from '@qti-components/shared';

/**
 * @summary The qti-default expression returns the default value of a declared variable.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.default
 *
 * Looks up the declaration of an itemVariable and returns the associated defaultValue
 * or NULL if no default value was declared. Supports item identifier prefixing
 * for obtaining default values from individual items in outcomes processing.
 */
export class QtiDefault extends QtiExpression<any> {
  @property({ type: String }) identifier: string = '';

  @consume({ context: itemContext, subscribe: true })
  @state()
  protected override context?: ItemContext;

  @state()
  @consume({ context: testContext, subscribe: true })
  protected _testContext?: TestContext;

  public override getResult(): any {
    if (!this.identifier) {
      console.error('qti-default requires an identifier attribute');
      return null;
    }

    // Check for item identifier prefixing (format: "itemId.variableId")
    const parts = this.identifier.split('.');

    let itemId: string | null = null;
    let variableId: string;

    if (parts.length === 2) {
      itemId = parts[0];
      variableId = parts[1];
    } else if (parts.length === 1) {
      variableId = parts[0];
    } else {
      console.error('qti-default: invalid identifier format');
      return null;
    }

    // If item identifier is specified, look in that specific item
    if (itemId) {
      const itemContext = this._testContext.items.find(item => item.identifier === itemId);
      console.debug(`itemContext: ${JSON.stringify(itemContext)}`);
      if (!this._testContext || !itemContext) {
        console.warn(`qti-default: item "${itemId}" not found in test context`);
        return null;
      }
      const variable = this._testContext.items
        .find(item => item.identifier === itemId)
        ?.variables.find(v => v.identifier === variableId);
      if (!variable) {
        console.warn(`qti-default: variable "${variableId}" not found in item "${itemId}"`);
        return null;
      }
      return variable.defaultValue || null;
    }

    // Otherwise, look in the current item context
    if (!this.context?.variables) {
      console.warn('qti-default: no variables found in item context');
      return null;
    }
    const variable = this.context.variables.find(v => v.identifier === variableId);
    if (!variable) {
      console.warn(`qti-default: variable "${variableId}" not found in item context`);
      return null;
    }
    return variable.defaultValue || null;
  }
}

customElements.define('qti-default', QtiDefault);
