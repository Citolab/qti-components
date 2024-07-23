import { qtiTransformItem, qtiTransformManifest, qtiTransformTest } from 'src/lib/qti-transformers';

export const fetchItem = async (packageUri: string, index: number, cancelPreviousRequest = true): Promise<any> => {
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

  const itemHTML = await qtiTransformItem()
    .load(itemUri, cancelPreviousRequest)
    .then(api =>
      api
        .path(itemUri.substring(0, itemUri.lastIndexOf('/')))
        .stripStyleSheets()
        .html()
    );

  return { itemXML: itemHTML, items: itemsFromTest };
};
