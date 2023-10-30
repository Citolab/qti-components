import * as cheerio from 'cheerio';
import { TestContext } from './qti-assessment-test.context';

/**
 * Fetches an IMS manifest XML file from the given href and returns the first resource element with type "imsqti_test_xmlv3p0".
 * @param href - The URL of the IMS manifest XML file.
 * @returns The first resource element with type "imsqti_test_xmlv3p0".
 */
const testFromImsmanifest = async href => {
  const response = await fetch(href);
  const imsmanifestXML = await response.text();
  //   await new Promise<void>(r => setTimeout(() => r(), 1000)); // Add some delay for demo purposes
  const $ = cheerio.load(imsmanifestXML, { xmlMode: true, xml: { xmlMode: true } });
  const el = $('resource[type="imsqti_test_xmlv3p0"]').first();
  return el;
};

/**
 * Retrieves items from an assessment test.
 * @param href - The URL of the assessment test.
 * @returns A Promise that resolves to an array of objects containing the identifier, href, and category of each item.
 */
const itemsFromAssessmentTest = async (
  href: string
): Promise<{ identifier: string; href: string; category: string }[]> => {
  const response = await fetch(href);
  const assessmentTestXML = await response.text();
  //   await new Promise<void>(r => setTimeout(() => r(), 1000)); // Add some delay for demo purposes
  const $ = cheerio.load(assessmentTestXML, { xmlMode: true, xml: { xmlMode: true } });
  const items: { identifier: string; href: string; category: string }[] = [];
  $('qti-assessment-item-ref').each((_, element) => {
    const identifier = $(element).attr('identifier')!;
    const href = $(element).attr('href')!;
    const category = $(element).attr('category');
    items.push({ identifier, href, category });
  });
  return items;
};

let _controller = new AbortController();

/**
 * Requests an XML item from the specified URL.
 * @param href - The URL of the XML item to request.
 * @returns A Promise that resolves to the XML item as a string.
 */
export async function requestItem(href: string) {
  const fetchXml = async (href: string): Promise<string> => {
    try {
      const xmlFetch = await fetch(href, { signal });
      const xmlText = await xmlFetch.text();
      return xmlText;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error(error);
      }
    }
    return '';
  };
  _controller?.abort();
  _controller = new AbortController();
  const signal = _controller.signal;

  return await fetchXml(href);
}

export type ManifestData = {
  itemLocation: string;
  testIdentifier: string;
  items: {
    identifier: string;
    href: string;
    category: string;
  }[];
};

/**
 * Fetches manifest data for a given package URI.
 * @param packageUri The URI of the package to fetch manifest data for.
 * @returns A Promise that resolves to a ManifestData object.
 */
export const fetchManifestData = async (packageUri: string): Promise<ManifestData> => {
  if (!packageUri.endsWith('/')) {
    packageUri = packageUri + '/';
  }
  const assessmentTestEl = await testFromImsmanifest(packageUri + '/imsmanifest.xml');
  const items = await itemsFromAssessmentTest(packageUri + assessmentTestEl.attr('href'));
  const itemLocation = `${packageUri}/${assessmentTestEl
    .attr('href')
    .substring(0, assessmentTestEl.attr('href').lastIndexOf('/'))}/`;
  return { itemLocation, items, testIdentifier: assessmentTestEl.attr('identifier')! };
};
