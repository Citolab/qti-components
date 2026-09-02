import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { html, render } from 'lit';

import '../../register';

import type { QtiItemSessionControl } from './qti-item-session-control';

describe('QtiItemSessionControl', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should have default values', async () => {
    render(html`<qti-item-session-control></qti-item-session-control>`, container);
    const el = container.querySelector('qti-item-session-control') as QtiItemSessionControl;
    await el.updateComplete;

    expect(el.maxAttempts).toBe(1);
    expect(el.showFeedback).toBe(false);
    expect(el.allowReview).toBe(true);
    expect(el.showSolution).toBe(false);
    expect(el.allowComment).toBe(false);
    expect(el.allowSkipping).toBe(true);
    expect(el.validateResponses).toBe(false);
  });

  it('should honor overrides', async () => {
    render(
      html`
        <qti-item-session-control
          max-attempts="3"
          show-feedback="true"
          allow-review="false"
          show-solution="true"
          allow-comment="true"
          allow-skipping="false"
          validate-responses="true"
        ></qti-item-session-control>
      `,
      container
    );
    const el = container.querySelector('qti-item-session-control') as QtiItemSessionControl;
    await el.updateComplete;

    expect(el.maxAttempts).toBe(3);
    expect(el.showFeedback).toBe(true);
    expect(el.allowReview).toBe(false);
    expect(el.showSolution).toBe(true);
    expect(el.allowComment).toBe(true);
    expect(el.allowSkipping).toBe(false);
    expect(el.validateResponses).toBe(true);
  });

  it('should dispatch qti-item-session-control-connected when connected', async () => {
    const connectedEvent = new Promise<CustomEvent>(resolve => {
      container.addEventListener('qti-item-session-control-connected', (e: any) => resolve(e), { once: true });
    });

    render(html`<qti-item-session-control identifier="test-control"></qti-item-session-control>`, container);
    const event = await connectedEvent;
    expect(event.detail).toBeInstanceOf(HTMLElement);
    expect(event.detail.localName).toBe('qti-item-session-control');
  });
});
