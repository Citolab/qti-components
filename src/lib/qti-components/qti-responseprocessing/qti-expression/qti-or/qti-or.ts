import { html } from "lit";
import { Calculate } from "../../../qti-utilities/ExpressionResult";
import { QtiExpression } from "../qti-expression";
import { QtiConditionExpression } from "../qti-condition-expression";

export class QtiOr extends QtiConditionExpression {
  override render() {
    return html``;
  }

  public override calculate() {
    // children can be a mix of qti-expression and qti-condition-expression
    const values = Array.from(this.children).map((c) => {
      const condition = c as QtiExpression<any>;
      if (!condition.calculate) {
        console.error("Element doesn't implement QtiConditionExpression");
        return null;
      }
      let value = condition.calculate();
      // convert string value to boolean and return null if not possible
      if (typeof value === "string") {
        if (value === "true") {
          value = true;
        } else if (value === "false") {
          value = false;
        } else {
          console.error("unexpected value in qti-or, expected boolean");
          return null;
        }
      }
      return value;
    });
    return values.some((e) => {
      return typeof e === "boolean" && e;
    });
  }
}

customElements.define("qti-or", QtiOr);
