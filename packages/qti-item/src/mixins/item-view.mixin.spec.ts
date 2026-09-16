import { LitElement, html } from 'lit';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { ItemViewMixin } from './item-view.mixin';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { View } from '@qti-components/base';

/**
 * `ItemViewMixin` resolves the audience a standalone item is presented to, which is what makes
 * `view`-tagged content — a scorer's `qti-rubric-block`, above all — visible. The item
 * stylesheet hides `[view]` and reveals it again on `.show`, so the class IS the behaviour;
 * these tests assert it directly rather than through a computed style, which would only be
 * re-testing the sheet.
 *
 * Mounted on a bare LitElement host: the mixin takes its assessment item from the
 * `qti-assessment-item-connected` event, so nothing here needs `<qti-item>` or a real item
 * parse. The host is registered under a test-only tag, leaving the real ones free.
 */
class ViewHost extends ItemViewMixin(LitElement) {
  override render() {
    return html`<slot></slot>`;
  }
}

if (!customElements.get('item-view-host')) {
  customElements.define('item-view-host', ViewHost);
}

describe('ItemViewMixin', () => {
  let container: HTMLDivElement;
  let host: ViewHost;
  let assessmentItem: HTMLElement;

  /** A stand-in item carrying one rubric block per audience. */
  const mountItem = (): void => {
    assessmentItem = document.createElement('div');
    assessmentItem.innerHTML = `
      <qti-item-body>
        <div view="scorer" id="scorer">answer model</div>
        <div view="tutor" id="tutor">teaching note</div>
      </qti-item-body>
    `;
    host.appendChild(assessmentItem);
    host.dispatchEvent(
      new CustomEvent('qti-assessment-item-connected', { detail: assessmentItem as unknown as QtiAssessmentItem })
    );
  };

  const shown = (id: string): boolean => !!assessmentItem.querySelector(`#${id}`)?.classList.contains('show');

  const setView = async (view: View): Promise<void> => {
    host.view = view;
    await host.updateComplete;
  };

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    host = document.createElement('item-view-host') as ViewHost;
    container.appendChild(host);
    await host.updateComplete;
  });

  afterEach(() => {
    container.remove();
  });

  it('defaults to the candidate view, so no view-tagged content is shown', () => {
    expect(host.view).toBe('candidate');
    mountItem();
    expect(shown('scorer')).toBe(false);
    expect(shown('tutor')).toBe(false);
  });

  it('shows only the content addressed to the current view', async () => {
    mountItem();
    await setView('scorer');

    expect(shown('scorer')).toBe(true);
    expect(shown('tutor')).toBe(false);
  });

  it('hides it again when the view moves on', async () => {
    mountItem();
    await setView('scorer');
    await setView('candidate');

    expect(shown('scorer')).toBe(false);
  });

  // The view is usually set before the item has parsed, so resolving only on change would
  // leave the first item rendered for the wrong audience.
  it('resolves an item that connects after the view was set', async () => {
    await setView('scorer');
    mountItem();

    expect(shown('scorer')).toBe(true);
  });

  it('accepts a view switch dispatched by a child control', async () => {
    mountItem();
    host.dispatchEvent(new CustomEvent('item-switch-view', { detail: 'scorer', bubbles: true }));
    await host.updateComplete;

    expect(host.view).toBe('scorer');
    expect(shown('scorer')).toBe(true);
  });

  /*
   * The hook `@qti-components/corrections` overrides to pair scorer view with the answer key.
   * It has to run on every resolve, including the one triggered by the item connecting, or a
   * marker's key would depend on whether the item beat the view.
   */
  it('reports each resolved view to updateAssessmentItemView', async () => {
    const seen: View[] = [];
    host.updateAssessmentItemView = (_item, view) => void seen.push(view);

    mountItem();
    await setView('scorer');

    expect(seen).toEqual(['candidate', 'scorer']);
  });
});
