import { QtiAssessmentItem } from '../qti-components';
import { qtiTransformItem, qtiTransformTest } from '../qti-transformers';
import { qtiTransformManifest } from '../qti-transformers/qti-transform-manifest';

export type ManifestInfo = {
  itemsURI: string;
  testIdentifier: string;
  testHTMLDoc: DocumentFragment;
  testURI: string;
  testURL: string;
  items: {
      identifier: string;
      href: string;
      category: string;
  }[];
};

// Utility function to ensure package URIs end with a '/'
const normalizeUri = (uri: string) => (uri.endsWith('/') ? uri : `${uri}/`);

// Fetches assessment data from the manifest
export const getManifestInfo = async (manifestUri: string): Promise<ManifestInfo> => {
  const normalizedUri = normalizeUri(manifestUri);

  const test = await qtiTransformManifest()
    .load(`${normalizedUri}`)
    .then(api => api.assessmentTest());

  const testHTMLDoc = await qtiTransformTest()
    .load(`${normalizedUri}${test.href}`)
    .then(api => api.htmldoc());

  const items = await qtiTransformTest()
    .load(`${normalizedUri}${test.href}`)
    .then(api => api.items());

  const baseUri = normalizedUri.substring(0, normalizedUri.lastIndexOf('/'));
  const testURL = `${baseUri}/${test.href}`;
  const testURI = `${baseUri}/${test.href.substring(0, test.href.lastIndexOf('/'))}`;
  const itemURI = `${testURI}/${items[0].href.substring(0, items[0].href.lastIndexOf('/'))}`;

  return {
    testHTMLDoc,
    itemsURI: itemURI,
    testURI,
    testURL,
    items,
    testIdentifier: test.identifier
  };
};

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

// Fetches a single item by URI
export const getItemByUri = async (itemUri: string, cancelPreviousRequest = true): Promise<QtiAssessmentItem> => {
  return qtiTransformItem()
    .load(itemUri, cancelPreviousRequest)
    .then(api =>
      api
        .path(itemUri.substring(0, itemUri.lastIndexOf('/')))
        .htmldoc().firstElementChild as QtiAssessmentItem
    );
};
