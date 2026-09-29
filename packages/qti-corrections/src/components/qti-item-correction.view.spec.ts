import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { QtiItemCorrection } from './qti-item-correction';

import type { QtiAssessmentItem } from '@qti-components/elements';

/**
 * Scorer view and the answer key travel together on a standalone item, the pairing
 * `QtiTestCorrection` already makes inside a test (`showCorrectResponse(view === 'scorer')`).
 * `ItemViewMixin` resolves the view and reveals the scorer's rubric block; this subclass is
 * what adds the key to it, so a marker gets both from one switch.
 *
 * The correction subclass is registered under the REAL tag, as in the other correction specs:
 * this file imports no base `qti-item`, so the tag is free.
 */
if (!customElements.get('qti-item')) {
  customElements.define('qti-item', QtiItemCorrection);
}

describe('QtiItemCorrection view pairing', () => {
  let container: HTMLDivElement;
  let host: QtiItemCorrection;
  let shownCalls: boolean[];
  let assessmentItem: HTMLElement;

  /**
   * A stand-in assessment item exposing the correction API the host calls. `_context` is read
   * by `QtiItem`'s own connected handler, so it has to be here even though this test is not
   * about variables.
   */
  const connectItem = (): void => {
    assessmentItem = document.createElement('div');
    Object.assign(assessmentItem, {
      _context: { variables: [] },
      identifier: 'ITEM',
      title: 'Item',
      showCorrectResponse: (show: boolean) => void shownCalls.push(show)
    });
    host.appendChild(assessmentItem);
    host.dispatchEvent(
      new CustomEvent('qti-assessment-item-connected', { detail: assessmentItem as unknown as QtiAssessmentItem })
    );
  };

  beforeEach(async () => {
    shownCalls = [];
    container = document.createElement('div');
    document.body.appendChild(container);
    host = document.createElement('qti-item') as QtiItemCorrection;
    container.appendChild(host);
    await host.updateComplete;
  });

  afterEach(() => {
    container.remove();
  });

  it('shows the correct response when the view switches to scorer', async () => {
    connectItem();
    shownCalls.length = 0;

    host.view = 'scorer';
    await host.updateComplete;

    expect(shownCalls).toEqual([true]);
  });

  it('withdraws it again for a non-scorer view', async () => {
    connectItem();
    host.view = 'scorer';
    await host.updateComplete;
    shownCalls.length = 0;

    host.view = 'tutor';
    await host.updateComplete;

    expect(shownCalls).toEqual([false]);
  });

  // An item that parses after the view was set must still arrive with the key on, or the
  // marker's view would depend on a load race.
  it('shows it on an item that connects while already in scorer view', async () => {
    host.view = 'scorer';
    await host.updateComplete;

    connectItem();

    expect(shownCalls).toContain(true);
  });

  it('reports the key state to item-show-correct-response controls', async () => {
    const control = document.createElement('item-show-correct-response') as HTMLElement & { shown?: boolean };
    host.appendChild(control);
    connectItem();

    host.view = 'scorer';
    await host.updateComplete;

    expect(control.shown).toBe(true);
  });
});
