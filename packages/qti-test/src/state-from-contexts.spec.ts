import { describe, expect, it } from 'vitest';

import { stateFromContexts } from './state-from-contexts';

describe('stateFromContexts', () => {
  it('keeps the values of every item, the test outcomes and the position', () => {
    const state = stateFromContexts(
      {
        items: [
          {
            identifier: 'item-1',
            variables: [
              { identifier: 'RESPONSE', type: 'response', value: 'A' },
              { identifier: 'SCORE', type: 'outcome', value: '1' }
            ],
            state: { RESPONSE: '{"pci":1}' }
          }
        ],
        testOutcomeVariables: [{ identifier: 'TOTAL', value: '3' }]
      },
      { navPartId: 'P1', navSectionId: 'S1', navItemRefId: 'item-1', plugins: { bookmarks: ['item-1'] } }
    );

    expect(state).toEqual({
      version: 1,
      test: {
        items: [
          {
            identifier: 'item-1',
            variables: [
              { identifier: 'RESPONSE', type: 'response', value: 'A' },
              { identifier: 'SCORE', type: 'outcome', value: '1' }
            ],
            state: { RESPONSE: '{"pci":1}' }
          }
        ],
        outcomes: [{ identifier: 'TOTAL', value: '3' }]
      },
      session: { navPartId: 'P1', navSectionId: 'S1', navItemRefId: 'item-1', plugins: { bookmarks: ['item-1'] } }
    });
  });

  it('reads a context as a 9.x host stored it: numbers as strings, metadata and host fields left out', () => {
    const state = stateFromContexts({
      items: [
        {
          identifier: 'item-1',
          href: 'items/item-1.xml',
          outcomes: [{ identifier: 'SCORE', value: 0 }],
          variables: [
            { identifier: 'SCORE', cardinality: 'single', baseType: 'float', value: 0, defaultValue: null },
            { identifier: 'numAttempts', cardinality: 'single', baseType: 'integer', value: '2' },
            { identifier: 'RESPONSE', cardinality: 'multiple', baseType: 'integer', value: [1, 2] },
            { identifier: 'EMPTY', value: null },
            { identifier: 'MISSING' }
          ]
        }
      ]
    } as never);

    expect(state.test.items).toEqual([
      {
        identifier: 'item-1',
        variables: [
          { identifier: 'SCORE', value: '0' },
          { identifier: 'numAttempts', value: '2' },
          { identifier: 'RESPONSE', value: ['1', '2'] },
          { identifier: 'EMPTY', value: null },
          { identifier: 'MISSING', value: null }
        ]
      }
    ]);
    expect(state.session).toEqual({});
  });

  it('keeps only the variable types QTI knows', () => {
    const state = stateFromContexts({
      items: [{ identifier: 'item-1', variables: [{ identifier: 'X', type: 'custom', value: 'x' }] }]
    });
    expect(state.test.items[0].variables).toEqual([{ identifier: 'X', value: 'x' }]);
  });

  it('skips items without an identifier and leaves out empty plugins', () => {
    const state = stateFromContexts({ items: [{ variables: [] }, { identifier: 'item-2' }] }, { plugins: {} });
    expect(state.test.items).toEqual([{ identifier: 'item-2', variables: [] }]);
    expect(state.session).toEqual({});
  });

  it('gives an empty state for nothing stored', () => {
    expect(stateFromContexts(undefined)).toEqual({ version: 1, test: { items: [], outcomes: [] }, session: {} });
  });

  it('copies, so changing the state leaves the stored context alone', () => {
    const value = ['A', 'B'];
    const plugins = { zoom: 2 };
    const state = stateFromContexts(
      { items: [{ identifier: 'i', variables: [{ identifier: 'R', value }] }] },
      { plugins }
    );
    (state.test.items[0].variables[0].value as string[]).push('C');
    (state.session.plugins as Record<string, unknown>).zoom = 3;
    expect(value).toEqual(['A', 'B']);
    expect(plugins).toEqual({ zoom: 2 });
  });
});
