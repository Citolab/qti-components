import { loadXML, parseXML } from './qti-transformers';

export const qtiTransformManifest = (): {
  load: (uri: string, signal?: AbortSignal) => Promise<typeof api>;
  assessmentTest: () => { href: string; identifier: string };
} => {
  let xmlFragment: XMLDocument;

  const api = {
    async load(uri, signal) {
      return new Promise<typeof api>(resolve => {
        loadXML(uri, signal).then(xml => {
          xmlFragment = xml;
          return resolve(api);
        });
      });
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
