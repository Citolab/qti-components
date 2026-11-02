import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import '../../register';

import type { TestEndAttempt } from './test-end-attempt';
import type { ComputedContext } from '@qti-components/base';

describe('TestEndAttempt', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be disabled when allowSkipping is false and isDefault is true', async () => {
    const el = document.createElement('test-end-attempt') as TestEndAttempt;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [
        {
          active: true,
          identifier: 'part1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          sections: [
            {
              active: true,
              identifier: 'section1',
              title: 'Section 1',
              navigationMode: 'nonlinear',
              submissionMode: 'individual',
              items: [
                {
                  identifier: 'item1',
                  active: true,
                  allowSkipping: false,
                  valid: true,
                  isDefaultResponse: true
                }
              ]
            }
          ]
        }
      ]
    } as any;

    (el as any).computedContext = context;
    await el.updateComplete;

    expect(el).toBeDisabled();
  });

  it('should be enabled when allowSkipping is false and isDefault is false', async () => {
    const el = document.createElement('test-end-attempt') as TestEndAttempt;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [
        {
          active: true,
          identifier: 'part1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          sections: [
            {
              active: true,
              identifier: 'section1',
              title: 'Section 1',
              navigationMode: 'nonlinear',
              submissionMode: 'individual',
              items: [
                {
                  identifier: 'item1',
                  active: true,
                  allowSkipping: false,
                  valid: true,
                  isDefaultResponse: false
                }
              ]
            }
          ]
        }
      ]
    } as any;

    (el as any).computedContext = context;
    await el.updateComplete;

    expect(el).toBeEnabled();
  });

  it('should be disabled when allowSkipping is false and valid is false', async () => {
    const el = document.createElement('test-end-attempt') as TestEndAttempt;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [
        {
          active: true,
          identifier: 'part1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          sections: [
            {
              active: true,
              identifier: 'section1',
              title: 'Section 1',
              navigationMode: 'nonlinear',
              submissionMode: 'individual',
              items: [
                {
                  identifier: 'item1',
                  active: true,
                  allowSkipping: false,
                  valid: false,
                  isDefaultResponse: false
                }
              ]
            }
          ]
        }
      ]
    } as any;

    (el as any).computedContext = context;
    await el.updateComplete;

    expect(el).toBeDisabled();
  });

  it('should be enabled when allowSkipping is true even if isDefault is true', async () => {
    const el = document.createElement('test-end-attempt') as TestEndAttempt;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [
        {
          active: true,
          identifier: 'part1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          sections: [
            {
              active: true,
              identifier: 'section1',
              title: 'Section 1',
              navigationMode: 'nonlinear',
              submissionMode: 'individual',
              items: [
                {
                  identifier: 'item1',
                  active: true,
                  allowSkipping: true,
                  valid: true,
                  isDefaultResponse: true
                }
              ]
            }
          ]
        }
      ]
    } as any;

    (el as any).computedContext = context;
    await el.updateComplete;

    expect(el).toBeEnabled();
  });

  it('should be disabled when non-adaptive item has numAttempts >= maxAttempts', async () => {
    const el = document.createElement('test-end-attempt') as TestEndAttempt;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [
        {
          active: true,
          identifier: 'part1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          sections: [
            {
              active: true,
              identifier: 'section1',
              title: 'Section 1',
              navigationMode: 'nonlinear',
              submissionMode: 'individual',
              items: [
                {
                  identifier: 'item1',
                  active: true,
                  allowSkipping: true,
                  valid: true,
                  isDefaultResponse: false,
                  adaptive: false,
                  numAttempts: 1,
                  maxAttempts: 1
                }
              ]
            }
          ]
        }
      ]
    } as any;

    (el as any).computedContext = context;
    await el.updateComplete;

    expect(el).toBeDisabled();
  });

  it('should default maxAttempts to 1 for non-adaptive items when not set', async () => {
    const el = document.createElement('test-end-attempt') as TestEndAttempt;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [
        {
          active: true,
          identifier: 'part1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          sections: [
            {
              active: true,
              identifier: 'section1',
              title: 'Section 1',
              navigationMode: 'nonlinear',
              submissionMode: 'individual',
              items: [
                {
                  identifier: 'item1',
                  active: true,
                  allowSkipping: true,
                  valid: true,
                  isDefaultResponse: false,
                  adaptive: false,
                  numAttempts: 1
                }
              ]
            }
          ]
        }
      ]
    } as any;

    (el as any).computedContext = context;
    await el.updateComplete;

    expect(el).toBeDisabled();
  });

  it('should be enabled when non-adaptive item has numAttempts < maxAttempts', async () => {
    const el = document.createElement('test-end-attempt') as TestEndAttempt;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [
        {
          active: true,
          identifier: 'part1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          sections: [
            {
              active: true,
              identifier: 'section1',
              title: 'Section 1',
              navigationMode: 'nonlinear',
              submissionMode: 'individual',
              items: [
                {
                  identifier: 'item1',
                  active: true,
                  allowSkipping: true,
                  valid: true,
                  isDefaultResponse: false,
                  adaptive: false,
                  numAttempts: 1,
                  maxAttempts: 3
                }
              ]
            }
          ]
        }
      ]
    } as any;

    (el as any).computedContext = context;
    await el.updateComplete;

    expect(el).toBeEnabled();
  });

  it('should not disable for adaptive items even when numAttempts >= maxAttempts', async () => {
    const el = document.createElement('test-end-attempt') as TestEndAttempt;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [
        {
          active: true,
          identifier: 'part1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          sections: [
            {
              active: true,
              identifier: 'section1',
              title: 'Section 1',
              navigationMode: 'nonlinear',
              submissionMode: 'individual',
              items: [
                {
                  identifier: 'item1',
                  active: true,
                  allowSkipping: true,
                  valid: true,
                  isDefaultResponse: false,
                  adaptive: true,
                  numAttempts: 3,
                  maxAttempts: 1
                }
              ]
            }
          ]
        }
      ]
    } as any;

    (el as any).computedContext = context;
    await el.updateComplete;

    expect(el).toBeEnabled();
  });

  it('should be disabled for an adaptive item once it is completed', async () => {
    const el = document.createElement('test-end-attempt') as TestEndAttempt;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [
        {
          active: true,
          identifier: 'part1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          sections: [
            {
              active: true,
              identifier: 'section1',
              title: 'Section 1',
              navigationMode: 'nonlinear',
              submissionMode: 'individual',
              items: [
                {
                  identifier: 'item1',
                  active: true,
                  allowSkipping: true,
                  valid: true,
                  isDefaultResponse: false,
                  adaptive: true,
                  completionStatus: 'completed',
                  numAttempts: 2,
                  maxAttempts: 1
                }
              ]
            }
          ]
        }
      ]
    } as any;

    (el as any).computedContext = context;
    await el.updateComplete;

    expect(el).toBeDisabled();
  });

  it('should not disable when maxAttempts is 0 (unlimited)', async () => {
    const el = document.createElement('test-end-attempt') as TestEndAttempt;
    container.appendChild(el);

    const context: ComputedContext = {
      view: 'candidate',
      identifier: 'test',
      title: 'Test',
      testParts: [
        {
          active: true,
          identifier: 'part1',
          navigationMode: 'nonlinear',
          submissionMode: 'individual',
          sections: [
            {
              active: true,
              identifier: 'section1',
              title: 'Section 1',
              navigationMode: 'nonlinear',
              submissionMode: 'individual',
              items: [
                {
                  identifier: 'item1',
                  active: true,
                  allowSkipping: true,
                  valid: true,
                  isDefaultResponse: false,
                  adaptive: false,
                  numAttempts: 5,
                  maxAttempts: 0
                }
              ]
            }
          ]
        }
      ]
    } as any;

    (el as any).computedContext = context;
    await el.updateComplete;

    expect(el).toBeEnabled();
  });

  describe('for an item of its own', () => {
    /** ITEM-1 is active and can still be checked; ITEM-2 has used its one attempt. */
    const context = (): ComputedContext =>
      ({
        view: 'candidate',
        identifier: 'test',
        title: 'Test',
        testParts: [
          {
            active: true,
            identifier: 'part1',
            sections: [
              {
                active: true,
                identifier: 'section1',
                items: [
                  { identifier: 'ITEM-1', active: true, adaptive: false, numAttempts: 0, maxAttempts: 1 },
                  { identifier: 'ITEM-2', active: false, adaptive: false, numAttempts: 1, maxAttempts: 1 }
                ]
              }
            ]
          }
        ]
      }) as any;

    it('is disabled by the item-ref it sits in, not by the active item', async () => {
      const ref = document.createElement('qti-assessment-item-ref');
      ref.setAttribute('identifier', 'ITEM-2');
      container.appendChild(ref);
      const el = document.createElement('test-end-attempt') as TestEndAttempt;
      ref.appendChild(el);

      (el as any).computedContext = context();
      await el.updateComplete;

      expect(el).toBeDisabled();
    });

    it('looks out through a shadow root for its item-ref', async () => {
      const ref = document.createElement('qti-assessment-item-ref');
      ref.setAttribute('identifier', 'ITEM-2');
      container.appendChild(ref);
      const inner = document.createElement('div');
      ref.appendChild(inner);
      const el = document.createElement('test-end-attempt') as TestEndAttempt;
      inner.attachShadow({ mode: 'open' }).appendChild(el);

      (el as any).computedContext = context();
      await el.updateComplete;

      expect(el).toBeDisabled();
    });

    it('is enabled when its item can still be checked, even when the active one cannot', async () => {
      const ref = document.createElement('qti-assessment-item-ref');
      ref.setAttribute('identifier', 'ITEM-1');
      container.appendChild(ref);
      const el = document.createElement('test-end-attempt') as TestEndAttempt;
      ref.appendChild(el);

      const ctx = context();
      ctx.testParts[0].sections[0].items[0].active = false;
      ctx.testParts[0].sections[0].items[1].active = true;
      (el as any).computedContext = ctx;
      await el.updateComplete;

      expect(el).toBeEnabled();
    });

    it('follows the item attribute over the item-ref it sits in', async () => {
      const ref = document.createElement('qti-assessment-item-ref');
      ref.setAttribute('identifier', 'ITEM-1');
      container.appendChild(ref);
      const el = document.createElement('test-end-attempt') as TestEndAttempt;
      el.setAttribute('item', 'ITEM-2');
      ref.appendChild(el);

      (el as any).computedContext = context();
      await el.updateComplete;

      expect(el).toBeDisabled();
    });

    it('standalone, follows the active item', async () => {
      const el = document.createElement('test-end-attempt') as TestEndAttempt;
      container.appendChild(el);

      (el as any).computedContext = context();
      await el.updateComplete;

      expect(el).toBeEnabled();
    });
  });
});
