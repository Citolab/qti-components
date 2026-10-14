import './register';
import { inlineScriptText, inlineStyleText } from './qti-portable-custom-interaction';
import { requireJsVersion } from './vendor/require-js';

type WithIframeContent = HTMLElement & { generateIframeContent(): string };

const iframeHtml = (attributes: Record<string, string> = {}) => {
  const pci = document.createElement('qti-portable-custom-interaction') as unknown as WithIframeContent;
  for (const [name, value] of Object.entries(attributes)) pci.setAttribute(name, value);
  document.body.appendChild(pci);
  const html = pci.generateIframeContent();
  pci.remove();
  return html;
};

describe('what the PCI iframe loads', () => {
  it('inlines RequireJS and the shared vocabulary, and loads nothing from a URL', () => {
    const doc = new DOMParser().parseFromString(iframeHtml(), 'text/html');
    expect([...doc.querySelectorAll('script[src], link[href]')]).toEqual([]);
    expect(doc.querySelector('script[type="module"]')).toBeNull();
    const scripts = [...doc.querySelectorAll('script')].map(s => s.textContent ?? '');
    expect(scripts.some(s => s.includes(`RequireJS ${requireJsVersion}`))).toBe(true);
    const styles = [...doc.querySelectorAll('style')].map(s => s.textContent ?? '').join('\n');
    expect(styles).toContain('.qti-layout-row');
    expect(styles).toContain('.qti-well');
  });

  it("loads the host's own RequireJS, bundle and stylesheet when named", () => {
    const doc = new DOMParser().parseFromString(
      iframeHtml({
        'data-require-js-url': 'https://player.example/require.js',
        'data-components-cdn-url': 'https://player.example/qti-components.js',
        'data-components-css-url': 'https://player.example/item.css'
      }),
      'text/html'
    );
    expect(doc.querySelector('script[src]')?.getAttribute('src')).toBe('https://player.example/require.js');
    expect(doc.querySelector('script[type="module"]')?.textContent).toContain(
      'https://player.example/qti-components.js'
    );
    expect(doc.querySelector('link[rel="stylesheet"]')?.getAttribute('href')).toBe('https://player.example/item.css');
  });

  it('keeps inline text from closing its element early', () => {
    expect(inlineScriptText('a("</script>")')).toBe('a("<\\/script>")');
    expect(inlineStyleText('/* </STYLE> */')).toBe('/* <\\/STYLE> */');
  });
});
