import { qtiTransformItem, qtiTransformTest } from '../qti-transformers';
import { qtiTransformManifest } from '../qti-transformers/qti-transform-manifest';

import type { QtiAssessmentItem } from '../qti-components';

export type ManifestInfo = {
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
// const normalizeUri = (uri: string) => (uri.endsWith('/') ? uri : `${uri}/`);

// Fetches assessment data from the manifest
export const getManifestInfo = async (manifestURL: string): Promise<ManifestInfo> => {
  const baseURI = manifestURL.substring(0, manifestURL.lastIndexOf('/'));

  const test = await qtiTransformManifest()
    .load(`${manifestURL}`)
    .then(api => api.assessmentTest());

  const testHTMLDoc = await qtiTransformTest()
    .load(`${baseURI}/${test.href}`)
    .then(api => api.htmlDoc());

  const items = await qtiTransformTest()
    .load(`${baseURI}/${test.href}`)
    .then(api => api.items());

  const testURL = `${baseURI}/${test.href}`;
  const testURI = `${baseURI}/${test.href.substring(0, test.href.lastIndexOf('/'))}`;

  return {
    testHTMLDoc,
    testURI,
    testURL,
    items,
    testIdentifier: test.identifier
  };
};

// Fetches a single item by URI
export const getItemByUri = async (itemUri: string): Promise<QtiAssessmentItem> => {
  return qtiTransformItem()
    .load(itemUri)
    .then(api => api.htmlDoc().firstElementChild as QtiAssessmentItem);
};
