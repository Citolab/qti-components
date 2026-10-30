import { afterEach, describe, expect, it } from 'vitest';

import '../../register';
import '@qti-components/interactions/register-all';

import type { ConfigContext } from '@qti-components/base';

/** Resolves on the PCI frame runtime's first message (its size): the runtime runs and the postMessage bridge works. */
const frameMessage = (iframe: HTMLIFrameElement) =>
  new Promise<MessageEvent>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no message from the PCI frame')), 5000);
    window.addEventListener('message', function onMessage(event: MessageEvent) {
      if (event.source !== iframe.contentWindow || event.data?.source !== 'qti-pci-iframe') return;
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      resolve(event);
    });
  });

describe('qti-test: the PCI iframe attributes for every item (ConfigContext.pciIframe)', () => {
  afterEach(() => document.body.replaceChildren());

  it('a PCI in the test gets the sandbox and allow the test is configured with', async () => {
    const test = document.createElement('qti-test') as HTMLElement & { configContext: ConfigContext };
    test.configContext = { pciIframe: { sandbox: 'allow-scripts', allow: 'autoplay' } };
    document.body.appendChild(test);
    // Where an item's interaction sits: inside the test, which provides the config to everything below it.
    const pci = document.createElement('qti-portable-custom-interaction');
    test.appendChild(pci);
    const iframe = pci.querySelector('iframe')!;

    const event = await frameMessage(iframe);
    expect(iframe.getAttribute('sandbox')).toBe('allow-scripts');
    expect(iframe.getAttribute('allow')).toBe('autoplay');
    expect(event.origin).toBe('null');
  });

  it('without it a PCI in the test runs as before', async () => {
    const test = document.createElement('qti-test');
    document.body.appendChild(test);
    const pci = document.createElement('qti-portable-custom-interaction');
    test.appendChild(pci);
    const iframe = pci.querySelector('iframe')!;

    const event = await frameMessage(iframe);
    expect(iframe.hasAttribute('sandbox')).toBe(false);
    expect(iframe.hasAttribute('allow')).toBe(false);
    expect(event.origin).toBe(window.location.origin);
  });
});
