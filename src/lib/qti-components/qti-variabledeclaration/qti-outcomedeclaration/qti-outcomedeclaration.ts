import { OutcomeVariable } from '../../qti-utilities/OutcomeVariable';
import { QtiVariableDeclaration } from '../qti-variabledeclaration';

export class QtiOutcomeDeclaration extends QtiVariableDeclaration {
  // fIXME: PK: attributes
  static override get observedAttributes() {
    return ['identifier', 'cardinality', 'base-type'];
  }

  get interpolationTable() {
    const table = this.querySelector("qti-interpolation-table");
    if (table) {
      const entries = new Map<number, number>();
      for (const entry of table.querySelectorAll(
        "qti-interpolation-table-entry"
      )) {
        if (
          !entry.getAttribute("source-value") &&
          entry.getAttribute("target-value")
        ) {
          console.error(
            "source-value or target-value is missing in qti-interpolation-table-entry"
          );
        }
        const sourceValue = parseInt(entry.getAttribute("source-value"));
        const targetValue = parseInt(entry.getAttribute("target-value"));
        if (isNaN(sourceValue) || isNaN(targetValue)) {
          console.error(
            "source-value or target-value is not a number in qti-interpolation-table-entry"
          );
        }
        entries.set(sourceValue, targetValue);
      }
    }
    return null;
  }

  public override connectedCallback() {
    super.connectedCallback();

    const identifier = this.getAttribute('identifier');
    const outcomeVariable = new OutcomeVariable();
    outcomeVariable.identifier = identifier;

    // this.emit("qti-register-variable", { detail: { variable: outcomeVariable } });
    this.dispatchEvent(
      new CustomEvent('qti-register-variable', {
        bubbles: true,
        composed: true,
        detail: { variable: outcomeVariable }
      })
    );

    // const qtiAssessmentItem = this.closest("qti-assessment-item") as QtiAssessmentItem
    // qtiAssessmentItem.variables.push(outcomeVariable);
  }
}

customElements.define('qti-outcome-declaration', QtiOutcomeDeclaration);
