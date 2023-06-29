import { LitElement, css, html } from 'lit';
import { QtiAssessmentItem } from '../../qti-assessment-item/qti-assessment-item';
import { ResponseVariable } from '../../qti-utilities/ResponseVariable';
import { QtiMultiple } from './qti-multiple/qti-multiple';
import { state } from 'lit/decorators.js';
import { VariableDeclaration } from '../../qti-utilities/VariableDeclaration';

export class QtiExpression<T> extends LitElement {
  protected _error = [];

  @state()
  protected set error(val: string) {
    const oldVal = this._error;
    this._error.push(val);
    this.requestUpdate('error', oldVal);
  }

  static styles = css`
    [role='alert'] {
      border: 1px solid red;
      background: pink;
      color: red;
      padding: 0.5rem 0.25rem;
      font-size: small;
      border-radius: 5px;
      margin-bottom: 3px;
    }
  `;

  override render() {
    return html`${this._error.map(error => html`<div role="alert">${error}</div>`)}`;
  }

  public calculate(): T {
    // eslint-disable-next-line no-throw-literal
    throw new Error('Not implemented');
  }

  protected get assessmentItem(): QtiAssessmentItem {
    return this.closest('qti-assessment-item') as QtiAssessmentItem;
  }

  protected getVariables = (): VariableDeclaration<string | string[]>[] =>
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
            const variable = this.assessmentItem.getVariable(identifier);
            return variable;
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
