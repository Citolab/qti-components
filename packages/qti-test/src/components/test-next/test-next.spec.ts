import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import type { TestNext } from './test-next';
import './test-next';
import type { ComputedContext } from '@qti-components/base';

describe('TestNext', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be disabled when there is no computedContext', async () => {
    const el = document.createElement('test-next') as TestNext;
    container.appendChild(el);
    await el.updateComplete;

    expect(el).toBeDisabled();
  });

  it('should be enabled in nonlinear mode even if item is not completed', async () => {
    const el = document.createElement('test-next') as any;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [{
        active: true,
        identifier: 'part1',
        navigationMode: 'nonlinear',
        submissionMode: 'individual',
        sections: [{
          active: true,
          identifier: 'section1',
          title: 'Section 1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          items: [
            { identifier: 'item1', active: true, variables: [], completionStatus: 'not_attempted' },
            { identifier: 'item2', active: false, variables: [], completionStatus: 'not_attempted' }
          ]
        }]
      }]
    };

    el.computedContext = context;
    await el.updateComplete;

    expect(el).toBeEnabled();
  });

  it('should be disabled in linear mode when current item is not completed', async () => {
    const el = document.createElement('test-next') as any;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [{
        active: true,
        identifier: 'part1',
        navigationMode: 'linear',
        submissionMode: 'individual',
        sections: [{
          active: true,
          identifier: 'section1',
          title: 'Section 1',
          navigationMode: 'linear',
          submissionMode: 'individual',
          items: [
            { identifier: 'item1', active: true, variables: [], completionStatus: 'not_attempted' },
            { identifier: 'item2', active: false, variables: [], completionStatus: 'not_attempted' }
          ]
        }]
      }]
    };

    el.computedContext = context;
    await el.updateComplete;

    expect(el).toBeDisabled();
  });

  it('should be enabled in linear mode even if not completed if submission mode is simultaneous', async () => {
    const el = document.createElement('test-next') as any;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [{
        active: true,
        identifier: 'part1',
        navigationMode: 'linear',
        submissionMode: 'simultaneous',
        sections: [{
          active: true,
          identifier: 'section1',
          title: 'Section 1',
          navigationMode: 'linear',
          submissionMode: 'simultaneous',
          items: [
            { identifier: 'item1', active: true, variables: [], completionStatus: 'not_attempted' },
            { identifier: 'item2', active: false, variables: [], completionStatus: 'not_attempted' }
          ]
        }]
      }]
    };

    el.computedContext = context;
    await el.updateComplete;

    expect(el).toBeEnabled();
  });

  it('should be enabled in linear mode when current item is submitted', async () => {
    const el = document.createElement('test-next') as any;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [
        {
          active: true,
          identifier: 'part1',
          navigationMode: 'linear',
          submissionMode: 'individual',
          sections: [
            {
              active: true,
              identifier: 'section1',
              title: 'Section 1',
              navigationMode: 'linear',
              submissionMode: 'individual',
              items: [
                {
                  identifier: 'item1',
                  active: true,
                  variables: [
                    {
                      identifier: 'numAttempts',
                      type: 'outcome',
                      cardinality: 'single',
                      baseType: 'integer',
                      value: '1',
                      defaultValue: '0'
                    }
                  ],
                  completionStatus: 'completed'
                },
                {
                  identifier: 'item2',
                  active: false,
                  variables: [
                    {
                      identifier: 'numAttempts',
                      type: 'outcome',
                      cardinality: 'single',
                      baseType: 'integer',
                      value: '1',
                      defaultValue: '0'
                    }
                  ],
                  completionStatus: 'not_attempted'
                }
              ]
            }
          ]
        }
      ]
    };

    el.computedContext = context;
    await el.updateComplete;

    expect(el).toBeEnabled();
  });

  it('should be disabled in linear mode when current item is completed but not submitted', async () => {
    const el = document.createElement('test-next') as any;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [{
        active: true,
        identifier: 'part1',
        navigationMode: 'linear',
        submissionMode: 'individual',
        sections: [{
          active: true,
          identifier: 'section1',
          title: 'Section 1',
          navigationMode: 'linear',
          submissionMode: 'individual',
          items: [
            { identifier: 'item1', active: true, variables: [], completionStatus: 'completed'},
            { identifier: 'item2', active: false, variables: [], completionStatus: 'not_attempted' }
          ]
        }]
      }]
    };

    el.computedContext = context;
    await el.updateComplete;

    expect(el).toBeDisabled();
  });

  it('should be disabled on the last item', async () => {
    const el = document.createElement('test-next') as any;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [{
        active: true,
        identifier: 'part1',
        navigationMode: 'nonlinear',
        submissionMode: 'individual',
        sections: [{
          active: true,
          identifier: 'section1',
          title: 'Section 1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          items: [
            { identifier: 'item1', active: false, variables: [], completionStatus: 'completed' },
            { identifier: 'item2', active: true, variables: [], completionStatus: 'completed' }
          ]
        }]
      }]
    };

    el.computedContext = context;
    await el.updateComplete;

    expect(el).toBeDisabled();
  });
});
