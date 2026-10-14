import './register';

type WithIframeContent = HTMLElement & { generateIframeContent(): string };

const iframeLang = (host: HTMLElement) => {
  const pci = document.createElement('qti-portable-custom-interaction') as unknown as WithIframeContent;
  host.appendChild(pci);
  const html = pci.generateIframeContent();
  host.remove();
  return /<html lang="([^"]*)">/.exec(html)?.[1];
};

describe('the language of the PCI iframe', () => {
  afterEach(() => document.documentElement.removeAttribute('lang'));

  it('takes the xml:lang of the item', () => {
    const item = document.createElement('div');
    item.setAttribute('xml:lang', 'nl');
    document.body.appendChild(item);
    expect(iframeLang(item)).toBe('nl');
  });

  it('takes the nearest lang', () => {
    const item = document.createElement('div');
    item.setAttribute('lang', 'de-DE');
    document.body.appendChild(item);
    expect(iframeLang(item)).toBe('de-DE');
  });

  it("falls back to the page's lang, then to en", () => {
    const item = document.createElement('div');
    document.body.appendChild(item);
    document.documentElement.lang = 'fr';
    expect(iframeLang(item)).toBe('fr');
    document.documentElement.removeAttribute('lang');
    document.body.appendChild(item);
    expect(iframeLang(item)).toBe('en');
  });

  it('ignores a value that is not a language tag', () => {
    const item = document.createElement('div');
    item.setAttribute('lang', '"><script>');
    document.body.appendChild(item);
    expect(iframeLang(item)).toBe('en');
  });
});
