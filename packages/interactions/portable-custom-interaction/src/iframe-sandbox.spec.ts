import './register';

import type { QtiPortableCustomInteraction } from './qti-portable-custom-interaction';

const createPci = (attributes: Record<string, string> = {}) => {
  const pci = document.createElement('qti-portable-custom-interaction') as QtiPortableCustomInteraction;
  pci.setAttribute('response-identifier', 'RESPONSE');
  pci.setAttribute('module', 'pci');
  pci.setAttribute('custom-interaction-type-identifier', 'urn:test:pci');
  pci.setAttribute('data-base-url', '/assets/pci');
  for (const [name, value] of Object.entries(attributes)) pci.setAttribute(name, value);
  return pci;
};

const connect = async (pci: QtiPortableCustomInteraction) => {
  document.body.appendChild(pci);
  await pci.updateComplete;
  return pci;
};

const iframesOf = (pci: HTMLElement) => Array.from(pci.querySelectorAll('iframe'));

/** The iframe's attributes, minus `name`, which carries a timestamp. */
const attributesOf = (iframe: HTMLIFrameElement) =>
  Object.fromEntries(
    Array.from(iframe.attributes)
      .filter(attribute => attribute.name !== 'name')
      .map(attribute => [attribute.name, attribute.value])
  );

describe('the sandboxed PCI iframe', () => {
  afterEach(() => {
    document.body.querySelectorAll('qti-portable-custom-interaction').forEach(el => el.remove());
  });

  it('is not sandboxed by default', async () => {
    const pci = await connect(createPci());
    expect(pci.sandboxed).toBe(false);
    expect(pci.hasAttribute('sandboxed')).toBe(false);
    expect(iframesOf(pci)).toHaveLength(1);
    expect(iframesOf(pci)[0].hasAttribute('sandbox')).toBe(false);
  });

  it('gets sandbox="allow-scripts", without allow-same-origin, with the attribute', async () => {
    const pci = await connect(createPci({ sandboxed: '' }));
    expect(pci.sandboxed).toBe(true);
    const [iframe] = iframesOf(pci);
    expect(iframe.getAttribute('sandbox')).toBe('allow-scripts');
    expect(iframe.sandbox.contains('allow-same-origin')).toBe(false);
  });

  it('differs from the default iframe in the sandbox attribute only', async () => {
    const plain = iframesOf(await connect(createPci()))[0];
    const sandboxed = iframesOf(await connect(createPci({ sandboxed: '' })))[0];

    expect(sandboxed.srcdoc).toBe(plain.srcdoc);
    const { sandbox, ...rest } = attributesOf(sandboxed);
    expect(sandbox).toBe('allow-scripts');
    expect(rest).toEqual(attributesOf(plain));
  });

  it('is not a PCI property: the switch is not among the data attributes handed to the PCI', async () => {
    const pci = await connect(createPci({ sandboxed: '' }));
    expect(Object.keys(pci.dataset)).not.toContain('sandboxed');
    expect(Object.keys(pci.dataset)).not.toContain('sandbox');
  });

  it('reflects the property, so a clone (the correct-response viewer) is sandboxed too', async () => {
    const pci = createPci();
    pci.sandboxed = true;
    await connect(pci);
    expect(pci.hasAttribute('sandboxed')).toBe(true);
    expect(iframesOf(pci)[0].getAttribute('sandbox')).toBe('allow-scripts');

    const clone = pci.cloneNode(false) as QtiPortableCustomInteraction;
    clone.setAttribute('response-identifier', 'RESPONSE-correct');
    await connect(clone);
    expect(iframesOf(clone)[0].getAttribute('sandbox')).toBe('allow-scripts');
  });

  it('rebuilds the iframe when the switch changes on a connected interaction', async () => {
    const pci = await connect(createPci());
    const before = iframesOf(pci)[0];

    pci.sandboxed = true;
    await pci.updateComplete;
    expect(before.isConnected).toBe(false);
    expect(iframesOf(pci)).toHaveLength(1);
    expect(iframesOf(pci)[0].getAttribute('sandbox')).toBe('allow-scripts');

    pci.removeAttribute('sandboxed');
    await pci.updateComplete;
    expect(iframesOf(pci)).toHaveLength(1);
    expect(iframesOf(pci)[0].hasAttribute('sandbox')).toBe(false);
  });
});
