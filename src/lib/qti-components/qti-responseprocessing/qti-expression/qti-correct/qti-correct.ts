import { html } from "lit";
import { QtiExpression } from "../qti-expression";
import { QtiAssessmentItem } from "../../../qti-assessment-item/qti-assessment-item";

export class QtiCorrect extends QtiExpression<string|string[]> {
  override render() {
    return html``;
  }

  get interpretation() {
    return this.getAttribute("interpretation") || "";
  }

  override calculate() {
    const identifier = this.getAttribute("identifier") || "";
    const responseVariable = (
      this.closest("qti-assessment-item") as QtiAssessmentItem
    ).getResponse(identifier);
    responseVariable.correctResponse;
    if (responseVariable.cardinality !== "single") {
      return responseVariable.correctResponse.length > 0
        ? responseVariable.correctResponse[0]
        : "";
    } else {
      return responseVariable.correctResponse;
    }
  }
}

customElements.define('qti-correct', QtiCorrect);
