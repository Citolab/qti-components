import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import type { ResponseVariable, VariableDeclaration } from './variables';
import { itemContext } from './qti-assessment-item.context';
import type { QtiMultiple } from '../qti-components/qti-response-processing/qti-expression/qti-multiple/qti-multiple';
import type { ItemContext } from './item.context';

export interface QtiExpressionBase<T> {
  // get assessmentItem(): QtiAssessmentItem;

  // getVariables(): VariableDeclaration<number | string | (number | string)[] | null>[];
  calculate(): Readonly<T>;
}

export abstract class QtiExpression<T> extends LitElement implements QtiExpressionBase<T> {
  @state()
  protected result: any;

  // hide the slot with css
  static styles = css`
    slot {
      display: none;
    }
  `;

  override render() {
    return html`<pre>${JSON.stringify(this.result, null, 2)}</pre>
      <slot></slot>`;
  }

  public calculate(): Readonly<T> {
    this.result = this.getResult();
    return this.result;
  }

  protected getResult(): Readonly<T> {
    throw new Error('Not implemented');
  }

  @consume({ context: itemContext, subscribe: true })
  @state()
  protected context?: ItemContext;

  getVariables = (): VariableDeclaration<number | string | (number | string)[] | null>[] =>
    // FIXME: if this itself is multiple, this will never enter the qti-multiple switch
    // See this example here: https://github.com/1EdTech/qti-examples/blob/master/qtiv3-examples/packaging/items/Example05-feedbackBlock-adaptive.xml

    Array.from(this.children)
      .map((e: Element) => {
        switch (e.tagName.toLowerCase()) {
          case 'qti-base-value': {
            return {
              baseType: e.getAttribute('base-type'),
              value: e.textContent.trim(),
              cardinality: 'single'
            } as ResponseVariable;
          }
          case 'qti-variable': {
            const identifier = e.getAttribute('identifier') || '';
            const variable = this.context.variables.find(v => v.identifier === identifier) || null;
            return variable;
          }
          case 'qti-multiple': {
            const multiple = e as QtiMultiple;
            const values = multiple.getResult();
            if (values.length > 0) {
              return {
                identifier: '',
                baseType: values[0].baseType,
                value: values.map(v => v.value),
                cardinality: 'multiple',
                type: 'response'
              } as ResponseVariable;
            }
            return null;
          }
          case 'qti-correct': {
            const identifier = e.getAttribute('identifier') || '';
            const responseVariable: ResponseVariable =
              this.context.variables.find(v => v.identifier === identifier) || null;
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
              const value = expression.getResult();
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
