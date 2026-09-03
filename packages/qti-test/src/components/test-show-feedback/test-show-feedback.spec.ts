import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import '../../register';

import type { TestShowFeedback } from './test-show-feedback';
import type { ComputedContext } from '@qti-components/base';

const baseContext = (availableFeedbacks: ComputedContext['availableFeedbacks']): ComputedContext => ({
  view: 'candidate',
  identifier: 'test',
  title: 'Test',
  availableFeedbacks,
  testParts: []
});

describe('TestShowFeedback', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should be disabled when there is no computedContext', async () => {
    const el = document.createElement('test-show-feedback') as TestShowFeedback;
    container.appendChild(el);
    await el.updateComplete;

    expect(el).toBeDisabled();
  });

  it('should be disabled when no feedback is available', async () => {
    const el = document.createElement('test-show-feedback') as any;
    container.appendChild(el);

    el.computedContext = baseContext([]);
    await el.updateComplete;

    expect(el).toBeDisabled();
  });

  it('should be enabled when a test-root feedback (partId null) is available', async () => {
    const el = document.createElement('test-show-feedback') as any;
    container.appendChild(el);

    el.computedContext = baseContext([{ identifier: 'FB_END', partId: null }]);
    await el.updateComplete;

    expect(el).toBeEnabled();
  });

  it('should be enabled when an available feedback matches the active test-part', async () => {
    const el = document.createElement('test-show-feedback') as any;
    container.appendChild(el);

    el.sessionContext = { navPartId: 'part1' };
    el.computedContext = baseContext([{ identifier: 'FB_P1', partId: 'part1' }]);
    await el.updateComplete;

    expect(el).toBeEnabled();
  });

  it('should be disabled when the available feedback belongs to a different part', async () => {
    const el = document.createElement('test-show-feedback') as any;
    container.appendChild(el);

    el.sessionContext = { navPartId: 'part2' };
    el.computedContext = baseContext([{ identifier: 'FB_P1', partId: 'part1' }]);
    await el.updateComplete;

    expect(el).toBeDisabled();
  });

  it('should be disabled while the candidate is already viewing that feedback', async () => {
    const el = document.createElement('test-show-feedback') as any;
    container.appendChild(el);

    el.sessionContext = { navFeedbackIdentifier: 'FB_END' };
    el.computedContext = baseContext([{ identifier: 'FB_END', partId: null }]);
    await el.updateComplete;

    expect(el).toBeDisabled();
  });

  it('should dispatch a feedback navigation request with the available identifier on click', async () => {
    const el = document.createElement('test-show-feedback') as any;
    container.appendChild(el);

    el.computedContext = baseContext([{ identifier: 'FB_END', partId: null }]);
    await el.updateComplete;

    let detail: { type: string; id: string } | undefined;
    el.addEventListener('qti-request-navigation', (e: CustomEvent) => {
      detail = e.detail;
    });

    el.click();

    expect(detail).toEqual({ type: 'feedback', id: 'FB_END' });
  });

  it('should not dispatch navigation when disabled', async () => {
    const el = document.createElement('test-show-feedback') as any;
    container.appendChild(el);

    el.computedContext = baseContext([]);
    await el.updateComplete;

    let fired = false;
    el.addEventListener('qti-request-navigation', () => {
      fired = true;
    });

    el.click();

    expect(fired).toBe(false);
  });
});
