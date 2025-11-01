import { customElement, property } from 'lit/decorators.js';

import { QtiExpression } from '../../../../../src/lib/exports/qti-expression';

import type { integer } from '../../../../../src/lib/exports/expression-result';
import type { ResponseVariable } from '../../../../../src/lib/exports/variables';

@customElement('qti-index')
export class QtiIndex extends QtiExpression<any> {
  @property({ type: String })
  n!: string; // Required attribute, can be a number or an identifier

  public override getResult(): any {
    if (!this.n) {
      console.error('qti-index: missing required attribute "n"');
      return null;
    }

    // Check if there is exactly one child
    if (this.children.length !== 1) {
      console.error('qti-index: must have exactly one child container element');
      return null;
    }

    // Get the container from the child
    const containerVariable = this.getVariables()[0] as ResponseVariable;
    if (!containerVariable) {
      console.error('qti-index: missing container');
      return null;
    }

    // Determine the index value - either from n as a direct number or by looking up identifier
    let index: number;

    if (!isNaN(Number(this.n))) {
      // n is a direct number
      index = Number(this.n);
    } else {
      // n is an identifier - need to look up its value at runtime
      // This would require access to the QTI runtime context to resolve variables
      const variableValue = this.lookupVariableValue(this.n);
      if (variableValue === null) {
        console.error(`qti-index: variable "${this.n}" is not a valid number`);
        return null;
      }
      index = Number(variableValue);
    }

    // Check if index is a positive integer
    if (index <= 0 || !Number.isInteger(index)) {
      console.error('qti-index: index must be a positive integer');
      return null;
    }

    // Check if container has ordered values
    if (containerVariable.cardinality === 'ordered') {
      const containerValues = Array.isArray(containerVariable.value)
        ? containerVariable.value
        : [containerVariable.value];

      // Index out of bounds or container is NULL
      if (containerVariable.value === null || index > containerValues.length) {
        return null;
      }

      // Return the nth value (index is 1-based)
      return containerValues[index - 1];
    } else {
      console.error('qti-index: child must have ordered cardinality');
      return null;
    }
  }

  // Helper method to look up a variable value by identifier
  // This would need to be implemented based on your actual QTI runtime environment
  private lookupVariableValue(identifier: string): integer | null {
    const value = this.context.variables.find(v => v.identifier === identifier)?.value;
    // check if value is a number
    if (value === null || isNaN(Number(value))) {
      return null;
    }
    return Number(value) as integer;
  }
}
