import { LitElement, html } from 'lit';
import { QtiAssessmentItem } from '../../qti-assessment-item/qti-assessment-item';
import { ResponseVariable } from '../../qti-utilities/ResponseVariable';
import { QtiMultiple } from './qti-multiple/qti-multiple';

export class QtiExpression<T> extends LitElement {
  override render() {
    return html``;
  }

  public calculate(): T {
    // eslint-disable-next-line no-throw-literal
    throw new Error('Not implemented');
  }

  protected get assessmentItem(): QtiAssessmentItem {
    return this.closest('qti-assessment-item') as QtiAssessmentItem;
  }

  protected getVariables = (): ResponseVariable[] =>
    Array.from(this.children)
      .map((e: Element) => {
        switch (e.tagName.toLowerCase()) {
          case 'qti-base-value': {
            return {
              baseType: e.getAttribute('base-type'),
              value: e.textContent,
              cardinality: 'single'
            } as ResponseVariable;
          }
          case 'qti-variable': {
            const identifier = e.getAttribute('identifier') || '';
            const responseVariable = this.assessmentItem.getResponse(identifier);
            return responseVariable;
          }
          case 'qti-multiple': {
            const multiple = e as QtiMultiple;
            const values = multiple.calculate();
            if (values.length > 0) {
              return {
                baseType: values[0].baseType,
                value: values.map(v => v.value),
                cardinality: 'multiple'
              } as ResponseVariable;
            }
            return null;
          }
          case 'qti-correct': {
            const identifier = e.getAttribute('identifier') || '';
            const responseVariable = this.assessmentItem.getResponse(identifier);
            return {
              baseType: responseVariable.baseType,
              value: responseVariable.correctResponse,
              cardinality: responseVariable.cardinality
            } as ResponseVariable;
          }
          default: {
            // added for use of qti-equal-rounded
            try {
              const expression = e as QtiExpression<number>;
              const value = expression.calculate();
              return {
                baseType: 'integer',
                value: value.toString(),
                cardinality: 'single'
              } as ResponseVariable;
            } catch (error) {
              console.warn('default not sufficient');
            }
            return null;
          }
        }
      })
      .filter(v => v !== null);
}

customElements.define('qti-expression', QtiExpression);
