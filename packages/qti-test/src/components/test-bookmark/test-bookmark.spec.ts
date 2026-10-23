import '@citolab/qti-components';

import { html, render } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { bookmarkedItems, TestBookmark } from './test-bookmark';

import type { QtiTest } from '../qti-test/qti-test';
import type { QtiTestState } from '../../types/qti-test-state';

if (!customElements.get('test-bookmark')) customElements.define('test-bookmark', TestBookmark);

/**
 * `test-bookmark` keeps the marks in the test's state (`session.plugins.bookmarks`): what a click
 * does is what a host that stores `state` ends up storing, and a restored state shows the marks
 * again. The item on screen is set through the session, as navigation would.
 */
const assessmentTest = html`
  <qti-test>
    <test-navigation>
      <test-bookmark>Bookmark</test-bookmark>
      <test-container>
        <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="Bookmarks">
          <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="simultaneous">
            <qti-assessment-section identifier="S1" title="S1" visible="true">
              <qti-assessment-item-ref identifier="ITEM-1" href="items/item-1.xml"></qti-assessment-item-ref>
              <qti-assessment-item-ref identifier="ITEM-2" href="items/item-2.xml"></qti-assessment-item-ref>
            </qti-assessment-section>
          </qti-test-part>
        </qti-assessment-test>
      </test-container>
    </test-navigation>
  </qti-test>
`;

const settle = async () => {
  for (let i = 0; i < 3; i++) await new Promise(resolve => setTimeout(resolve));
};

describe('test-bookmark', () => {
  let host: HTMLDivElement;
  let qtiTest: QtiTest;
  let bookmark: TestBookmark;

  const show = async (itemRefId: string | null) => {
    qtiTest.sessionContext = { ...qtiTest.sessionContext, navItemRefId: itemRefId };
    await settle();
  };

  beforeEach(async () => {
    host = document.createElement('div');
    render(assessmentTest, host);
    qtiTest = host.querySelector('qti-test') as QtiTest;
    bookmark = host.querySelector('test-bookmark') as TestBookmark;
    document.body.append(host);
    await settle();
  });

  afterEach(() => host.remove());

  it('is a button, disabled while no item is on screen', () => {
    expect(bookmark.getAttribute('role')).toBe('button');
    expect(bookmark.getAttribute('tabindex')).toBe('0');
    expect(bookmark.hasAttribute('disabled')).toBe(true);
    expect(bookmark.getAttribute('aria-pressed')).toBe('false');

    bookmark.click();
    expect(qtiTest.state.session.plugins).toBeUndefined();
  });

  it('marks the item on screen, and shows it in the state a host stores', async () => {
    await show('ITEM-1');
    expect(bookmark.hasAttribute('disabled')).toBe(false);

    bookmark.click();
    await settle();

    expect(bookmark.hasAttribute('bookmarked')).toBe(true);
    expect(bookmark.getAttribute('aria-pressed')).toBe('true');
    expect(qtiTest.state.session.plugins).toEqual({ bookmarks: ['ITEM-1'] });
  });

  it('keeps one mark per item, in the order they were marked, and follows the item on screen', async () => {
    await show('ITEM-2');
    bookmark.click();
    await show('ITEM-1');
    expect(bookmark.hasAttribute('bookmarked')).toBe(false);
    bookmark.click();
    await settle();

    expect(qtiTest.state.session.plugins).toEqual({ bookmarks: ['ITEM-2', 'ITEM-1'] });

    await show('ITEM-2');
    expect(bookmark.hasAttribute('bookmarked')).toBe(true);
  });

  it('removes the mark on a second click, and leaves no trace once none are left', async () => {
    await show('ITEM-1');
    bookmark.click();
    await settle();
    bookmark.click();
    await settle();

    expect(bookmark.hasAttribute('bookmarked')).toBe(false);
    expect(qtiTest.state.session.plugins).toBeUndefined();
  });

  it('toggles with Enter and Space', async () => {
    await show('ITEM-1');
    bookmark.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
    expect(qtiTest.state.session.plugins).toEqual({ bookmarks: ['ITEM-1'] });

    bookmark.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await settle();
    expect(qtiTest.state.session.plugins).toBeUndefined();
  });

  it('shows the marks of a restored state, and bookmarkedItems reads them', async () => {
    const stored: QtiTestState = {
      version: 1,
      test: { items: [], outcomes: [] },
      session: { plugins: { bookmarks: ['ITEM-2'] } }
    };
    qtiTest.state = stored;
    await show('ITEM-2');

    expect(bookmark.hasAttribute('bookmarked')).toBe(true);
    expect(bookmarkedItems({ plugins: qtiTest.sessionContext.plugins })).toEqual(['ITEM-2']);
    expect(bookmarkedItems(undefined)).toEqual([]);
  });

  describe('stamped into an item-ref (<template item-ref>)', () => {
    let own: TestBookmark;

    beforeEach(async () => {
      own = document.createElement('test-bookmark') as TestBookmark;
      own.textContent = 'Bookmark';
      host.querySelector('qti-assessment-item-ref[identifier="ITEM-2"]')!.append(own);
      await show('ITEM-1');
    });

    it('marks its own item, not the one on screen, and is never disabled', async () => {
      expect(own.hasAttribute('disabled')).toBe(false);

      own.click();
      await settle();

      expect(qtiTest.state.session.plugins).toEqual({ bookmarks: ['ITEM-2'] });
      expect(own.hasAttribute('bookmarked')).toBe(true);
      // The toolbar button follows the item on screen (ITEM-1), which is not marked.
      expect(bookmark.hasAttribute('bookmarked')).toBe(false);
    });

    it('is bookmarked when its own item is, whichever item is on screen', async () => {
      qtiTest.state = {
        version: 1,
        test: { items: [], outcomes: [] },
        session: { plugins: { bookmarks: ['ITEM-2'] } }
      };
      await show('ITEM-1');

      expect(own.hasAttribute('bookmarked')).toBe(true);
      expect(own.getAttribute('aria-pressed')).toBe('true');
    });
  });
});

/**
 * A page's CSS reset (Tailwind's preflight: `* { margin: 0; padding: 0; border: 0 solid }`) is a rule of the page and beats the
 * `:host` rules of a shadow root, so the look is on the inner `.control`, out of the reset's reach.
 */
describe('TestBookmark under a page reset', () => {
  it('keeps its padding and border', async () => {
    const reset = document.createElement('style');
    reset.textContent =
      '@layer base { *, ::before, ::after { box-sizing: border-box; margin: 0; padding: 0; border: 0 solid; } }';
    document.head.append(reset);
    const el = document.createElement('test-bookmark') as HTMLElement & { updateComplete: Promise<boolean> };
    el.textContent = 'Label';
    document.body.append(el);
    await el.updateComplete;

    const control = el.shadowRoot!.querySelector('.control')!;
    expect(control).toBeTruthy();
    expect(parseFloat(getComputedStyle(control).paddingLeft)).toBeGreaterThan(0);
    expect(parseFloat(getComputedStyle(control).borderTopWidth)).toBeGreaterThan(0);
    expect(el.getBoundingClientRect().width).toBeCloseTo(control.getBoundingClientRect().width, 0);

    el.remove();
    reset.remove();
  });
});
