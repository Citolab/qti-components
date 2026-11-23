/**
 * The PCI frame's role and accessible name (roadmap 6, step Q2: C1, C2, F-2).
 *
 * - C2: the frame keeps its native role (no `role="application"`) and has no redundant `aria-hidden`.
 * - C1: it is named by one attribute, `title`, in the R4 order: authored ARIA on the interaction,
 *   else its `qti-prompt`, else "Interactive question N", N counting the PCIs in the item. The
 *   frame document's `<title>` says the same.
 */
import './register';

const ready = (iframe: HTMLIFrameElement) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('no message from the PCI frame')), 5000);
    window.addEventListener('message', function onMessage(event: MessageEvent) {
      if (event.source !== iframe.contentWindow || event.data?.source !== 'qti-pci-iframe') return;
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      resolve();
    });
  });

/** Renders `markup` and returns the frame of each PCI in it, in document order. */
const frames = (markup: string): HTMLIFrameElement[] => {
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.body.appendChild(host);
  return Array.from(host.querySelectorAll('qti-portable-custom-interaction')).map(pci => pci.querySelector('iframe')!);
};

const item = (body: string) =>
  `<qti-assessment-item identifier="i"><qti-item-body>${body}</qti-item-body></qti-assessment-item>`;

describe('the PCI frame role and name', () => {
  afterEach(() => document.body.replaceChildren());

  it('keeps the native frame role and has no aria-hidden (C2)', () => {
    const [iframe] = frames(
      item('<qti-portable-custom-interaction response-identifier="R"></qti-portable-custom-interaction>')
    );
    expect(iframe.hasAttribute('role')).toBe(false);
    expect(iframe.hasAttribute('aria-hidden')).toBe(false);
  });

  it('is named by title only, never by aria-label (C1)', () => {
    const [iframe] = frames(
      item('<qti-portable-custom-interaction response-identifier="R"></qti-portable-custom-interaction>')
    );
    expect(iframe.getAttribute('title')).toBeTruthy();
    expect(iframe.hasAttribute('aria-label')).toBe(false);
  });

  it('takes an authored aria-label first', () => {
    const [iframe] = frames(
      item(`<qti-portable-custom-interaction response-identifier="R" aria-label="Draw the graph">
              <qti-prompt>Plot the points</qti-prompt>
            </qti-portable-custom-interaction>`)
    );
    expect(iframe.getAttribute('title')).toBe('Draw the graph');
  });

  it('takes the text an authored aria-labelledby points at', () => {
    const [iframe] = frames(
      item(`<p id="q1">Question <b>one</b></p><p id="q1b">of two</p>
            <qti-portable-custom-interaction response-identifier="R" aria-labelledby="q1 q1b">
              <qti-prompt>Plot the points</qti-prompt>
            </qti-portable-custom-interaction>`)
    );
    expect(iframe.getAttribute('title')).toBe('Question one of two');
  });

  it('takes the prompt when there is no authored ARIA', () => {
    const [iframe] = frames(
      item(`<qti-portable-custom-interaction response-identifier="R">
              <qti-prompt>  Plot the
                points  </qti-prompt>
            </qti-portable-custom-interaction>`)
    );
    expect(iframe.getAttribute('title')).toBe('Plot the points');
  });

  it('generates "Interactive question N", N counting the PCIs in the item', () => {
    const [first, second] = frames(
      item(`<qti-portable-custom-interaction response-identifier="A"></qti-portable-custom-interaction>
            <qti-portable-custom-interaction response-identifier="B"></qti-portable-custom-interaction>`)
    );
    expect(first.getAttribute('title')).toBe('Interactive question 1');
    expect(second.getAttribute('title')).toBe('Interactive question 2');
  });

  it('gives the frame document the same title, escaped', async () => {
    const [iframe] = frames(
      item(
        `<qti-portable-custom-interaction response-identifier="R" aria-label="x < y & &quot;z&quot;"></qti-portable-custom-interaction>`
      )
    );
    await ready(iframe);
    expect(iframe.contentDocument?.title).toBe('x < y & "z"');
  });
});
