import './register';

import type { ConfigContext } from '@qti-components/base';

type PciElement = HTMLElement & { configContext?: ConfigContext };

/** A PCI element, with `config` set as a provider (qti-item, qti-test) would before it connects. */
const mountPci = (config?: ConfigContext) => {
  const pci = document.createElement('qti-portable-custom-interaction') as PciElement;
  if (config) pci.configContext = config;
  document.body.appendChild(pci);
  return pci.querySelector('iframe')!;
};

/**
 * Resolves on the frame runtime's first message (its size, sent without a PCI module too): the runtime runs and the
 * postMessage bridge works.
 */
const ready = (iframe: HTMLIFrameElement) =>
  new Promise<MessageEvent>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no message from the PCI frame')), 5000);
    window.addEventListener('message', function onMessage(event: MessageEvent) {
      if (event.source !== iframe.contentWindow || event.data?.source !== 'qti-pci-iframe') return;
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      resolve(event);
    });
  });

describe('the PCI iframe attributes (ConfigContext.pciIframe)', () => {
  afterEach(() => document.body.replaceChildren());

  it('sets neither sandbox nor allow by default: the frame shares the page origin', async () => {
    const iframe = mountPci();
    const event = await ready(iframe);
    expect(iframe.hasAttribute('sandbox')).toBe(false);
    expect(iframe.hasAttribute('allow')).toBe(false);
    expect(event.origin).toBe(window.location.origin);
  });

  it('sandboxes the frame and sets its permissions policy when the config asks, and the PCI still runs', async () => {
    const iframe = mountPci({ pciIframe: { sandbox: 'allow-scripts', allow: 'autoplay' } });
    const event = await ready(iframe);
    expect(iframe.getAttribute('sandbox')).toBe('allow-scripts');
    expect(iframe.getAttribute('allow')).toBe('autoplay');
    // An opaque origin: the host page is out of reach, the bridge goes through postMessage only.
    expect(event.origin).toBe('null');
    expect(iframe.contentDocument).toBeNull();
  });
});
