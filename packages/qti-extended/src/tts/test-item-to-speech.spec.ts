import '@citolab/qti-components';
import '../register';

import { html, render } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A player in the toolbar (outside any item-ref) stops as soon as its test takes a navigation
 * request. It hears that from the test's public notification `qc-test-navigation-started`, not by
 * finding `<test-navigation>`: the notification goes up from the test, so the player listens on the
 * document and keeps only the ones its own test sends.
 */
const page = html`
  <qti-test id="own">
    <test-navigation>
      <test-item-to-speech><test-tts-play></test-tts-play></test-item-to-speech>
      <test-container></test-container>
    </test-navigation>
  </qti-test>
  <qti-test id="other"></qti-test>
`;

const notify = (target: Element, name = 'qc-test-navigation-started') =>
  target.dispatchEvent(
    new CustomEvent(name, { detail: { type: 'item', id: 'ITEM-2' }, bubbles: true, composed: true })
  );

describe('test-item-to-speech in the toolbar', () => {
  let host: HTMLDivElement;
  let cancel: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    host = document.createElement('div');
    render(page, host);
    document.body.append(host);
    await host.querySelector('test-item-to-speech')!.updateComplete;
    cancel = vi.spyOn(speechSynthesis, 'cancel').mockImplementation(() => {});
  });

  afterEach(() => {
    cancel.mockRestore();
    host.remove();
  });

  it('stops when its own test starts navigating', () => {
    notify(host.querySelector('#own')!);
    expect(cancel).toHaveBeenCalled();
  });

  it('stops on the old name too', () => {
    notify(host.querySelector('#own')!, 'cito-test-navigation-started');
    expect(cancel).toHaveBeenCalled();
  });

  it('leaves another test on the page alone', () => {
    notify(host.querySelector('#other')!);
    expect(cancel).not.toHaveBeenCalled();
  });

  it('lets go of the document once it is gone', () => {
    host.querySelector('test-item-to-speech')!.remove();
    cancel.mockClear();
    notify(host.querySelector('#own')!);
    expect(cancel).not.toHaveBeenCalled();
  });
});
