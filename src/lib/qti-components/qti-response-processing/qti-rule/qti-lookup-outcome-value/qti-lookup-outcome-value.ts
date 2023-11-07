import { OutcomeVariable, QtiExpression, QtiRule } from '@citolab/qti-components/qti-components';
import { customElement, property } from 'lit/decorators.js';
import { convertNumberToUniveralFormat } from '../../../internal/utils';

/**
 * The lookupOutcomeValue rule sets the value of an outcome variable to the value obtained
 * by looking up the value of the associated expression in the lookupTable associated
 * with the outcome's declaration.
 */
@customElement('qti-lookup-outcome-value')
export class QtiLookupOutcomeValue extends QtiRule {
  @property({ type: String }) identifier: string;

  get childExpression(): QtiExpression<string> {
    return this.firstElementChild as QtiExpression<string>;
  }

  public override process(): number {
    const identifier = this.getAttribute('identifier');
    const outcomeVariable = this.closest('qti-assessment-item').getVariable(identifier) as OutcomeVariable;
    let value;
    if (outcomeVariable.interpolationTable) {
      value = outcomeVariable.interpolationTable.get(parseInt(this.childExpression.calculate()));
    }
    if (!value) {
      console.warn('lookupOutcomeValue: value is null or undefined');
      return 0;
    }
    this.dispatchEvent(
      new CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>('qti-set-outcome-value', {
        bubbles: true,
        composed: true,
        detail: {
          outcomeIdentifier: this.identifier,
          value: convertNumberToUniveralFormat(value)
        }
      })
    );
    return value;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-lookup-outcome-value': QtiLookupOutcomeValue;
  }
}

// setVar(elem, (decl,value)=> {
//   let method;
//   if (decl.interpolationTable) {
//     method = function(K) {
//       let entries = decl.interpolationTable.entries;
//       let keys = Object.getOwnPropertyNames(entries);
//       for(let k of keys.sort().reverse()) {
//         let entry = entries[k];
//         let includeBoundary = entry.includeBoundary!=="false";
//         if (k<K || (includeBoundary && k==K))
//           return entry.targetValue;
//       }
//       return decl.interpolationTable.defaultValue;
//     }
//   } else if (decl.matchTable) {
//     method = function(K) {
//       let entry = decl.matchTable.entries[K];
//       if (!entry && decl.baseType=="pair")
//         entry = decl.matchTable.entries[swapPair(K)];
//       return entry? entry.targetValue: decl.matchTable.defaultValue;
//     }
//   } else {
//     return null;
//   }
//   return method? mapLookup(decl, method, value): null;
// });
