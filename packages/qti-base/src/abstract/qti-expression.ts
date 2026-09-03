import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';

import { itemContext } from '../context/item.context';
import { qtiContext } from '../context/qti.context';
import { testContext } from '../context/test.context';

import type { ItemContext } from '../context/types/item.types';
import type { QtiContext, QtiContextType } from '../context/qti.context';
import type { ResponseVariable, VariableDeclaration } from '../lib/variables';
import type { TestContext } from '../context/test.context';

export interface QtiExpressionBase<T> {
  // get assessmentItem(): QtiAssessmentItem;

  // getVariables(): VariableDeclaration<number | string | (number | string)[] | null>[];
  calculate(): Readonly<T>;
}

export abstract class QtiExpression<T> extends LitElement implements QtiExpressionBase<T> {
  @state()
  protected result: any;

  /*
   * Written here rather than imported from a .css file, and that is a packaging constraint rather
   * than a style preference.
   *
   * The rule used to live in qti-expression.css, imported with Vite's inline-stylesheet query so
   * DevTools could show source-file provenance. That query is a VITE specifier, and tsc copies it
   * verbatim into dist — so the published package shipped an import only a Vite-based consumer
   * could resolve. Every other consumer broke on it: plain Node, tsx, any non-Vite bundler. It was
   * the single such specifier reachable from this package, and it took down QTI-Editor's schema
   * check, which loads the components under tsx to build the real ProseMirror schema
   * (ERR_UNKNOWN_FILE_EXTENSION on a file that has nothing to do with schemas).
   *
   * A `build:assets` step used to copy the .css into dist beside it. That went too — it existed
   * only to give the unresolvable import something to point at.
   *
   * Two lines of CSS are not worth a dist that only one bundler can consume. If this ever grows
   * into a real stylesheet, give it a `.styles.ts` exporting a `css` template — the house pattern
   * everywhere else in this repo — rather than reintroducing a bundler-specific import.
   *
   * The element renders a debug <pre> of its computed result plus a <slot>; hiding the slot is all
   * the styling it has ever had.
   */
  static override styles = css`
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

  @consume({ context: qtiContext, subscribe: true })
  @state()
  protected qtiContext?: QtiContext;

  @consume({ context: testContext, subscribe: true })
  @state()
  protected _testContext?: TestContext;

  /**
   * Resolve a declared variable from the closest available scope: item-level
   * first, then the test-level outcome variables. So an expression used in an
   * assessmentTest's outcome processing can reference a test-level outcome
   * (e.g. a total set earlier in the same run) — which the QTI variable
   * expression is specified to do. Returns null when unresolved rather than
   * throwing, so callers degrade gracefully.
   */
  protected resolveVariable(identifier: string): VariableDeclaration<string | string[] | null> | null {
    return (
      this.context?.variables.find(v => v.identifier === identifier) ??
      this._testContext?.testOutcomeVariables?.find(v => v.identifier === identifier) ??
      null
    );
  }

  getVariables = (): (ResponseVariable | VariableDeclaration<QtiContextType>)[] =>
    // FIXME: if this itself is multiple, this will never enter the qti-multiple switch
    // See this example here: https://github.com/1EdTech/qti-examples/blob/master/qtiv3-examples/packaging/items/Example05-feedbackBlock-adaptive.xml

    Array.from(this.children)
      .map((e: Element) => {
        console.debug('getVariables', e.tagName.toLowerCase());
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

            // Special handling for QTI_CONTEXT
            if (identifier === 'QTI_CONTEXT') {
              if (!this.qtiContext?.QTI_CONTEXT) {
                console.warn('QTI_CONTEXT not available');
                return {
                  identifier: 'QTI_CONTEXT',
                  baseType: 'record',
                  value: this.qtiContext.QTI_CONTEXT,
                  cardinality: 'record',
                  type: 'context'
                } as VariableDeclaration<QtiContextType>;
              }
              return {
                identifier: 'QTI_CONTEXT',
                baseType: 'record',
                value: this.qtiContext.QTI_CONTEXT,
                cardinality: 'record',
                type: 'context'
              } as VariableDeclaration<QtiContextType>;
            }

            return this.resolveVariable(identifier);
          }
          case 'qti-multiple': {
            const multiple = e as QtiExpression<ResponseVariable[]>;

            const values = multiple.getResult();
            console.debug('values', values);
            if (values?.length > 0) {
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
          case 'qti-ordered': {
            const multiple = e as QtiExpression<ResponseVariable[]>;
            const values = multiple.getResult();
            if (values?.length > 0) {
              return {
                identifier: '',
                baseType: values[0].baseType,
                value: values.map(v => v.value),
                cardinality: 'ordered',
                type: 'response'
              } as ResponseVariable;
            }
            return null;
          }
          case 'qti-repeat': {
            const repeat = e as QtiExpression<ResponseVariable[]>;
            const values = repeat.getResult();
            if (values?.length > 0) {
              return values;
            }
            return null;
          }
          case 'qti-correct': {
            const identifier = e.getAttribute('identifier') || '';
            const responseVariable: ResponseVariable =
              this.context?.variables?.find(v => v.identifier === identifier) || null;
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
                value: value?.toString() || null,
                cardinality: 'single'
              } as ResponseVariable;
            } catch (error) {
              console.warn('default not sufficient');
            }
            return null;
          }
        }
      })
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .filter(v => v !== null);
}
