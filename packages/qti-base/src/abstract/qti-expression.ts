import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';

import { itemContext } from '../context/item.context';
import { qtiContext } from '../context/qti.context';
import { testContext } from '../context/test.context';

import type { ItemContext } from '../context/types/item.types';
import type { QtiContext, QtiContextType } from '../context/qti.context';
import type { Calculate } from '../lib/expression-result';
import type { BaseType } from '../lib/expression-result';
import type { ResponseVariable, VariableDeclaration } from '../lib/variables';
import type { TestContext } from '../context/test.context';

type ExpressionVariable = ResponseVariable | VariableDeclaration<QtiContextType>;

export interface QtiExpressionBase<T> {
  // get assessmentItem(): QtiAssessmentItem;

  // getVariables(): VariableDeclaration<number | string | (number | string)[] | null>[];
  calculate(): Readonly<T>;
}

/**
 * Wrap whatever an expression handed back in a variable, reading the base type
 * off the value itself.
 *
 * An operator that knows its own result type says so through `resultBaseType`
 * and that wins, because the QTI vocabulary fixes it regardless of the operands
 * — `qti-divide` is a float even when it divides two integers exactly. Only
 * when nothing is declared, as for a custom operator returning whatever the
 * host computed, is the type read off the value.
 *
 * Everything used to be labelled `integer`, and since `compareSingleValues`
 * parses an integer with `parseInt`, that silently truncated:
 * `equal(divide(5, 2), 2.4)` compared 2 against 2 and answered true.
 */
const variableFromValue = (value: unknown, declared?: BaseType): ResponseVariable => {
  /*
   * A NULL result is still a value: the operand exists and is NULL. Returning
   * nothing would drop it from the list, which both hides the NULL from
   * `qti-is-null` and shifts every operand after it — a binary operator with a
   * NULL first argument would silently read its second as its first. The base
   * type is moot here, since every operator tests the value before it.
   */
  if (value === null || value === undefined) {
    return {
      identifier: '',
      baseType: 'string',
      value: null,
      cardinality: 'single',
      type: 'response'
    } as ResponseVariable;
  }

  if (Array.isArray(value)) {
    return {
      identifier: '',
      baseType: declared ?? inferBaseType(value[0]),
      value: value.map(entry => String(entry)),
      cardinality: 'multiple',
      type: 'response'
    } as ResponseVariable;
  }

  return {
    identifier: '',
    baseType: declared ?? inferBaseType(value),
    value: String(value),
    cardinality: 'single',
    type: 'response'
  } as ResponseVariable;
};

/** A JS value's QTI base type. A string stays text; it is not re-parsed. */
const inferBaseType = (value: unknown): BaseType => {
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'float';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
};

const inferContainerBaseType = (expression: QtiExpression<unknown>, value: unknown): BaseType | undefined => {
  if (!Array.isArray(value) || value.length > 0) {
    return undefined;
  }

  return expression
    .lastVariables
    .find(variable => variable?.baseType && variable.baseType !== 'record' && variable.cardinality !== 'record')
    ?.baseType as BaseType | undefined;
};

export abstract class QtiExpression<T> extends LitElement implements QtiExpressionBase<T> {
  /*
   * Not `@state()`. Nothing renders it any more (see `render` below), so making
   * it reactive only scheduled an update per `calculate()` — and response
   * processing calls that on every expression of every rule it walks.
   */
  protected result: any;
  #lastVariables: ExpressionVariable[] = [];

  /**
   * What the last `calculate()` produced, or undefined if it has not run.
   *
   * This is the supported way to inspect a scoring run: process the responses,
   * then walk the rule tree reading this off each expression. A tool that wants
   * to visualise how a score came about gets the whole tree annotated with its
   * values, without the components having to re-render to show them.
   */
  public get lastResult(): Readonly<T> | undefined {
    return this.result;
  }

  public get lastVariables(): readonly ExpressionVariable[] {
    return this.#lastVariables;
  }

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

  /*
   * Just the slot. This used to render `JSON.stringify(this.result, null, 2)`
   * into a <pre> beside it — a development aid that nobody could see, because
   * expressions live inside `qti-response-processing`, which is `display: none`.
   * It cost a full serialisation of the result on every render.
   */
  override render() {
    return html`<slot></slot>`;
  }

  /*
   * Render once, then never again: the template above is constant, so every
   * later update is pure overhead.
   *
   * It is not the `@state()` decorators that drive those updates — `@consume`
   * subscribes through `ContextConsumer`, which calls `host.requestUpdate()`
   * itself on every context change, "in case this value is used in a template".
   * Here it is not. An item with 30 response-processing rules holds ~180
   * expression elements and the test context changes on every keystroke, so
   * that was ~180 renders per keystroke producing identical output.
   *
   * The subscriptions stay, because `calculate()` reads the current values when
   * a rule invokes it. Only the rendering stops.
   */
  protected override shouldUpdate(): boolean {
    return !this.hasUpdated;
  }

  public calculate(): Readonly<T> {
    this.result = this.getResult();
    return this.result;
  }

  protected getResult(): Readonly<T> {
    throw new Error('Not implemented');
  }

  /**
   * The base type this operator always produces, when the QTI vocabulary fixes
   * one regardless of its operands — `qti-divide` is a float even dividing two
   * integers exactly, and `qti-round` is an integer whatever it rounds.
   *
   * Left undefined by operators whose result type follows their operands (a
   * `qti-sum` of integers is an integer) and by those that return no number at
   * all; the type is then read off the value.
   */
  public get resultBaseType(): BaseType | undefined {
    return undefined;
  }

  /*
   * Subscribed but deliberately NOT `@state()`.
   *
   * An expression is pull-based: nothing reads these until a rule calls
   * `calculate()`, which reads whatever the consumer has by then. Marking them
   * reactive made every context change schedule a render of every expression
   * element in the document — an item with 30 response-processing rules holds
   * ~180 of them, and the test context changes on every keystroke. The
   * subscription still keeps the properties current; it just no longer asks
   * for a render nothing depends on.
   */
  @consume({ context: itemContext, subscribe: true })
  protected context?: ItemContext;

  @consume({ context: qtiContext, subscribe: true })
  protected qtiContext?: QtiContext;

  @consume({ context: testContext, subscribe: true })
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

  getVariables = (): ExpressionVariable[] => {
    // FIXME: if this itself is multiple, this will never enter the qti-multiple switch
    // See this example here: https://github.com/1EdTech/qti-examples/blob/master/qtiv3-examples/packaging/items/Example05-feedbackBlock-adaptive.xml

    const variables = Array.from(this.children)
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
          case 'qti-custom-operator': {
            // Not a QtiExpression — it has `calculate` but no `getResult`, so
            // the default branch below throws on it and the surrounding
            // expression is handed nothing.
            return variableFromValue((e as unknown as Calculate).calculate?.());
          }
          case 'qti-correct': {
            const identifier = e.getAttribute('identifier') || '';
            const responseVariable = this.context?.variables?.find(v => v.identifier === identifier) as
              | ResponseVariable
              | undefined;

            // A `qti-correct` naming a response that is not declared — a typo,
            // or an expression evaluated before the declaration registered —
            // used to dereference the null this deliberately produced and take
            // down the whole processing run. It is an unresolved variable, so
            // it is NULL.
            if (!responseVariable) {
              console.warn(`qti-correct: no response declaration for "${identifier}"`);
              return variableFromValue(null);
            }

            return {
              baseType: responseVariable.baseType,
              value: responseVariable.correctResponse,
              cardinality: responseVariable.cardinality
            } as ResponseVariable;
          }
          default: {
            // Every operator without a case of its own lands here.
            try {
              const expression = e as QtiExpression<unknown>;
              const result = expression.getResult();
              return variableFromValue(result, expression.resultBaseType ?? inferContainerBaseType(expression, result));
            } catch (error) {
              console.warn(`getVariables: could not read a value from <${e.tagName.toLowerCase()}>`, error);
            }
            return null;
          }
        }
      })
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .filter((v): v is ExpressionVariable => v !== null);

    this.#lastVariables = variables;
    return variables;
  };
}
