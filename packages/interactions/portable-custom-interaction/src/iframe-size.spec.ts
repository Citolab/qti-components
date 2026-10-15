import './register';

const waitFor = async (check: () => boolean, timeout = 3000) => {
  const start = performance.now();
  while (!check()) {
    if (performance.now() - start > timeout) throw new Error('timed out');
    await new Promise(resolve => setTimeout(resolve, 20));
  }
};

/**
 * A PCI element in a host of the given width, with its iframe initialized. `container` is the
 * interaction markup the PCI renders into: initializing adds it to #pci-container, so content set
 * before that would end up next to it and the iframe would be its 50px min-height higher.
 */
const mountPci = async (width: number) => {
  const host = document.createElement('div');
  host.style.width = `${width}px`;
  document.body.appendChild(host);
  host.appendChild(document.createElement('qti-portable-custom-interaction'));
  const markup = () =>
    host.querySelector('iframe')?.contentDocument?.querySelector<HTMLElement>('#pci-container qti-interaction-markup');
  await waitFor(() => !!markup());
  return { host, iframe: host.querySelector('iframe')!, container: markup()! };
};

describe('the size of the PCI iframe', () => {
  afterEach(() => document.body.replaceChildren());

  it('is as high as its content, margins included, without extra space', async () => {
    const { iframe, container } = await mountPci(400);
    container.innerHTML = '<div style="height: 200px; margin: 16px 0"></div>';
    await waitFor(() => iframe.style.height === '232px');
  });

  it('follows the content when it grows and shrinks', async () => {
    const { iframe, container } = await mountPci(400);
    container.innerHTML = '<div style="height: 300px"></div>';
    await waitFor(() => iframe.style.height === '300px');
    (container.firstElementChild as HTMLElement).style.height = '120px';
    await waitFor(() => iframe.style.height === '120px');
  });

  it('keeps the width of its host, also when the host gets narrower', async () => {
    const { host, iframe, container } = await mountPci(600);
    container.innerHTML = '<div style="height: 100px"></div>';
    await waitFor(() => iframe.style.height === '100px');
    expect(iframe.style.width).toBe('100%');
    host.style.width = '320px';
    expect(iframe.getBoundingClientRect().width).toBe(320);
  });
});
