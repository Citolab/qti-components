import { qtiTransformItem, qtiTransformManifest, qtiTransformTest } from 'src/lib/qti-transformers';

export const fetchItemFromManifest = async (
  packageUri: string,
  index: number,
  cancelPreviousRequest = true
): Promise<any> => {
  packageUri = packageUri.endsWith('/') ? packageUri : packageUri + '/';

  const testFromManifest = await qtiTransformManifest()
    .load(packageUri + 'imsmanifest.xml')
    .then(api => api.assessmentTest());

  const itemsFromTest = await qtiTransformTest()
    .load(packageUri + testFromManifest.href)
    .then(api => api.items());

  const itemUri =
    packageUri +
    testFromManifest.href.substring(0, testFromManifest.href.lastIndexOf('/')) +
    '/' +
    itemsFromTest[index].href;

  const xmlDoc = await qtiTransformItem()
    .load(itemUri, cancelPreviousRequest)
    .then(api => api.path(itemUri.substring(0, itemUri.lastIndexOf('/'))).stripStyleSheets());

  return { itemHTMLDoc: xmlDoc.htmldoc(), itemHTML: xmlDoc.html(), items: itemsFromTest };
};

export const fetchAssessmentFromManifest = async (packageUri: string): Promise<any> => {
  packageUri = packageUri.endsWith('/') ? packageUri : packageUri + '/';

  // Load the manifest and retrieve the assessment test
  const testFromManifest = await qtiTransformManifest()
    .load(packageUri + 'imsmanifest.xml')
    .then(api => api.assessmentTest());

  const assessmentHTML = await qtiTransformTest()
    .load(packageUri + testFromManifest.href)
    .then(api => api.htmldoc());

  const itemsFromTest = await qtiTransformTest()
    .load(packageUri + testFromManifest.href)
    .then(api => api.items());

  const uri = packageUri.substring(0, packageUri.lastIndexOf('/')) + '/' + testFromManifest.href;
  const assessmentLocation = `${uri.substring(0, uri.lastIndexOf('/'))}`;
  const itemLocation = `${assessmentLocation}/${itemsFromTest[0].href.substring(0, itemsFromTest[0].href.lastIndexOf('/'))}`;

  return {
    assessmentXML: assessmentHTML,
    itemLocation,
    assessmentLocation,
    items: itemsFromTest,
    testIdentifier: testFromManifest.identifier
  };
};

export const fetchItem = async (itemUri: string, cancelPreviousRequest = true): Promise<any> => {
  const itemHTML = await qtiTransformItem()
    .load(itemUri, cancelPreviousRequest)
    .then(api =>
      api
        .path(itemUri.substring(0, itemUri.lastIndexOf('/')))
        .stripStyleSheets()
        .html()
    );
  return itemHTML;
};
