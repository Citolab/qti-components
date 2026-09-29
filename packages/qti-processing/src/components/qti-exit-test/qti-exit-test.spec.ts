import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import '@citolab/qti-components';

import { QtiOutcomeProcessingProcessor } from '@qti-components/test';

import type { QtiRuleBase } from '@qti-components/base';
import type { QtiExitTest } from './qti-exit-test';

/**
 * `qti-exit-test` ends the test's outcome processing. It is exercised through
 * the processor that runs the rules, which is where the signal is caught.
 */
describe('qti-exit-test', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => testContainer.remove());

  const exitRule = () => {
    testContainer.innerHTML = '<qti-exit-test></qti-exit-test>';
    return testContainer.querySelector('qti-exit-test') as QtiExitTest;
  };

  const spyRule = () => ({ process: vi.fn() }) as unknown as QtiRuleBase & { process: ReturnType<typeof vi.fn> };

  it('stops the rules that follow it', () => {
    const before = spyRule();
    const after = spyRule();
    new QtiOutcomeProcessingProcessor().process([before, exitRule(), after]);

    expect(before.process).toHaveBeenCalled();
    expect(after.process).not.toHaveBeenCalled();
  });

  it('does not escape the processor as an error', () => {
    expect(() => new QtiOutcomeProcessingProcessor().process([exitRule()])).not.toThrow();
  });

  it('does not swallow a genuine error from another rule', () => {
    const boom = {
      process: () => {
        throw new Error('boom');
      }
    } as unknown as QtiRuleBase;

    expect(() => new QtiOutcomeProcessingProcessor().process([boom])).toThrow('boom');
  });
});
