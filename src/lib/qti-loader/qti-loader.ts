import { qtiTransformItem, qtiTransformManifest, qtiTransformTest } from '../qti-transformers';

export type ManifestData = {
  itemLocation: string;
  testIdentifier: string;
  assessmentXML: DocumentFragment;
  assessmentLocation: string;
  items: {
      identifier: string;
      href: string;
      category: string;
  }[];
};

// Utility function to ensure package URIs end with a '/'
const normalizeUri = (uri: string) => (uri.endsWith('/') ? uri : `${uri}/`);

// Fetches an item from a manifest by index
export const getItemByIndex = async (packageUri: string, index: number, cancelPreviousRequest = true): Promise<any> => {
  const normalizedUri = normalizeUri(packageUri);

  const test = await qtiTransformManifest()
    .load(`${normalizedUri}imsmanifest.xml`)
    .then(api => api.assessmentTest());

  const items = await qtiTransformTest()
    .load(`${normalizedUri}${test.href}`)
    .then(api => api.items());

  const itemUri = `${normalizedUri}${test.href.substring(0, test.href.lastIndexOf('/'))}/${items[index].href}`;

  const itemDoc = await qtiTransformItem()
    .load(itemUri, cancelPreviousRequest)
    .then(api => api.path(itemUri.substring(0, itemUri.lastIndexOf('/'))).stripStyleSheets());

  return {
    itemHTMLDoc: itemDoc.htmldoc(),
    itemHTML: itemDoc.html(),
    items
  };
};

// Fetches assessment data from the manifest
export const getAssessmentData = async (packageUri: string): Promise<ManifestData> => {
  const normalizedUri = normalizeUri(packageUri);

  const test = await qtiTransformManifest()
    .load(`${normalizedUri}imsmanifest.xml`)
    .then(api => api.assessmentTest());

  const assessmentDoc = await qtiTransformTest()
    .load(`${normalizedUri}${test.href}`)
    .then(api => api.htmldoc());

  const items = await qtiTransformTest()
    .load(`${normalizedUri}${test.href}`)
    .then(api => api.items());

  const baseUri = normalizedUri.substring(0, normalizedUri.lastIndexOf('/'));
  const assessmentLocation = `${baseUri}/${test.href.substring(0, test.href.lastIndexOf('/'))}`;
  const itemLocation = `${assessmentLocation}/${items[0].href.substring(0, items[0].href.lastIndexOf('/'))}`;

  return {
    assessmentXML: assessmentDoc,
    itemLocation,
    assessmentLocation,
    items,
    testIdentifier: test.identifier
  };
};

// Fetches a single item by URI
export const getItemByUri = async (itemUri: string, cancelPreviousRequest = true): Promise<DocumentFragment> => {
  return qtiTransformItem()
    .load(itemUri, cancelPreviousRequest)
    .then(api =>
      api
        .path(itemUri.substring(0, itemUri.lastIndexOf('/')))
        .stripStyleSheets()
        .htmldoc()
    );
};
