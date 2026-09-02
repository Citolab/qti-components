import { loadXML, parseXML } from './shared/xml';

export const qtiTransformManifest = (): {
  load: (uri: string, signal?: AbortSignal) => Promise<typeof api>;
  assessmentTest: () => { href: string; identifier: string };
} => {
  let xmlFragment: XMLDocument;

  const api = {
    // Awaits loadXML so a failed fetch (network, CORS, non-2xx) rejects this
    // promise. Callers own the failure: they can render it, retry it or let it
    // bubble — rather than it escaping as an unhandled rejection while their
    // own `await` never settles.
    async load(uri: string, signal?: AbortSignal) {
      xmlFragment = await loadXML(uri, signal);
      return api;
    },
    parse(xmlString: string) {
      xmlFragment = parseXML(xmlString);
    },
    assessmentTest() {
      const el = xmlFragment.querySelector('resource[type="imsqti_test_xmlv3p0"]');
      return { href: el.getAttribute('href'), identifier: el.getAttribute('identifier') };
    }
  };
  return api;
};
