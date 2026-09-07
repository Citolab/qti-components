import '@citolab/qti-components';

import type { QtiPrintedVariable } from './qti-printed-variable';
import type { ItemContext } from '@qti-components/base';
import type { VariableDeclaration } from '@qti-components/base';

type Variable = VariableDeclaration<unknown>;

const variable = (partial: Partial<Variable> & { identifier: string; value: unknown }): Variable =>
  ({ type: 'outcome', cardinality: 'single', ...partial }) as Variable;

/**
 * Mounts a printed variable against a hand-built item context. The element consumes
 * `itemContext`, and with no provider in the tree the assigned value stays put.
 */
async function print(attributes: Record<string, string>, variables: Variable[]): Promise<string> {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const attrs = Object.entries(attributes)
    .map(([name, value]) => `${name}="${value}"`)
    .join(' ');
  host.innerHTML = `<qti-printed-variable ${attrs}></qti-printed-variable>`;

  const element = host.querySelector('qti-printed-variable') as QtiPrintedVariable;
  (element as unknown as { context: ItemContext }).context = { variables } as ItemContext;
  await element.updateComplete;

  const text = element.shadowRoot?.textContent ?? '';
  host.remove();
  return text;
}

describe('qti-printed-variable', () => {
  describe('single cardinality', () => {
    it('prints the bare value, without JSON quoting', async () => {
      expect(await print({ identifier: 'RESPONSE' }, [variable({ identifier: 'RESPONSE', value: 'ChoiceA' })])).toBe(
        'ChoiceA'
      );
    });

    it('prints a number as authored', async () => {
      expect(
        await print({ identifier: 'SCORE' }, [variable({ identifier: 'SCORE', value: '4', baseType: 'integer' })])
      ).toBe('4');
    });

    it('prints nothing for a null value', async () => {
      expect(await print({ identifier: 'SCORE' }, [variable({ identifier: 'SCORE', value: null })])).toBe('');
    });

    it('prints nothing for an unknown identifier', async () => {
      expect(await print({ identifier: 'NOPE' }, [variable({ identifier: 'SCORE', value: '4' })])).toBe('');
    });
  });

  describe('ordered and multiple cardinality', () => {
    const t = variable({
      identifier: 'T',
      value: ['-98', '2', '-70', '48'],
      cardinality: 'ordered',
      baseType: 'integer'
    });

    it('joins the values with the default ";" delimiter', async () => {
      expect(await print({ identifier: 'T' }, [t])).toBe('-98;2;-70;48');
    });

    it('joins the values with an authored delimiter', async () => {
      expect(await print({ identifier: 'T', delimiter: ', ' }, [t])).toBe('-98, 2, -70, 48');
    });

    it('selects a single value with a 1-based index', async () => {
      expect(await print({ identifier: 'T', index: '1' }, [t])).toBe('-98');
      expect(await print({ identifier: 'T', index: '4' }, [t])).toBe('48');
    });

    it('prints nothing for an index outside the container', async () => {
      expect(await print({ identifier: 'T', index: '5' }, [t])).toBe('');
      expect(await print({ identifier: 'T', index: '0' }, [t])).toBe('');
    });

    it('prints nothing for an empty container', async () => {
      expect(await print({ identifier: 'T' }, [variable({ identifier: 'T', value: [], cardinality: 'ordered' })])).toBe(
        ''
      );
    });

    it('space separates the two halves of a directedPair', async () => {
      expect(
        await print({ identifier: 'P' }, [
          variable({ identifier: 'P', value: ['A B', 'C D'], cardinality: 'multiple', baseType: 'directedPair' })
        ])
      ).toBe('A B;C D');
    });

    it('applies the format to every value', async () => {
      expect(await print({ identifier: 'T', format: '%+d' }, [t])).toBe('-98;+2;-70;+48');
    });
  });

  describe('record cardinality', () => {
    const record = variable({
      identifier: 'QTI_CONTEXT',
      value: { candidateIdentifier: 'C1', testIdentifier: 'T1' },
      cardinality: 'record',
      baseType: 'record',
      type: 'context'
    });

    it('prints name=value pairs joined by the delimiter', async () => {
      expect(await print({ identifier: 'QTI_CONTEXT' }, [record])).toBe('candidateIdentifier=C1;testIdentifier=T1');
    });

    it('honours mapping-indicator and delimiter', async () => {
      expect(await print({ identifier: 'QTI_CONTEXT', 'mapping-indicator': ': ', delimiter: ' | ' }, [record])).toBe(
        'candidateIdentifier: C1 | testIdentifier: T1'
      );
    });

    it('prints a single field when field is given', async () => {
      expect(await print({ identifier: 'QTI_CONTEXT', field: 'candidateIdentifier' }, [record])).toBe('C1');
    });

    it('prints nothing for an unknown field', async () => {
      expect(await print({ identifier: 'QTI_CONTEXT', field: 'nope' }, [record])).toBe('');
    });
  });

  describe('format, base and power-form', () => {
    const score = variable({ identifier: 'SCORE', value: '3.14159', baseType: 'float' });

    it('formats with the format attribute', async () => {
      expect(await print({ identifier: 'SCORE', format: '%.2f' }, [score])).toBe('3.14');
      expect(await print({ identifier: 'SCORE', format: 'Score: %.1f' }, [score])).toBe('Score: 3.1');
    });

    it('prints an integer in another base', async () => {
      const n = variable({ identifier: 'N', value: '255', baseType: 'integer' });
      expect(await print({ identifier: 'N', base: '16' }, [n])).toBe('ff');
      expect(await print({ identifier: 'N', base: '2' }, [n])).toBe('11111111');
    });

    it('leaves a non-integer variable alone when base is set', async () => {
      expect(await print({ identifier: 'SCORE', base: '16' }, [score])).toBe('3.14159');
    });

    it('prints exponential form with power-form', async () => {
      expect(await print({ identifier: 'SCORE', 'power-form': '' }, [score])).toBe('3.14159e+00');
    });

    it('lets format win over base and power-form', async () => {
      const n = variable({ identifier: 'N', value: '255', baseType: 'integer' });
      expect(await print({ identifier: 'N', base: '16', 'power-form': '', format: '%d' }, [n])).toBe('255');
    });
  });

  // The mc_stat2 shape from issue #134: an ordered template variable printed into the body.
  it('prints an ordered template variable from a real item context', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    host.innerHTML = `
      <qti-assessment-item identifier="stat" title="stat">
        <qti-template-declaration identifier="t" cardinality="ordered" base-type="integer"></qti-template-declaration>
        <qti-template-processing>
          <qti-set-template-value identifier="t">
            <qti-ordered>
              <qti-base-value base-type="integer">3</qti-base-value>
              <qti-base-value base-type="integer">1</qti-base-value>
              <qti-base-value base-type="integer">2</qti-base-value>
            </qti-ordered>
          </qti-set-template-value>
        </qti-template-processing>
        <qti-item-body>
          Here is a set of numbers: <qti-printed-variable identifier="t" delimiter=", "></qti-printed-variable>
        </qti-item-body>
      </qti-assessment-item>`;

    const item = host.querySelector('qti-assessment-item') as HTMLElement & { updateComplete: Promise<unknown> };
    await item.updateComplete;
    // Template processing runs off connectedCallback's updateComplete.then().
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => setTimeout(resolve, 0));

    const printed = host.querySelector('qti-printed-variable') as QtiPrintedVariable;
    await printed.updateComplete;
    expect(printed.shadowRoot?.textContent).toBe('3, 1, 2');
    host.remove();
  });
});
