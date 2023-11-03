import * as cheerio from 'cheerio';
import { xml } from 'lit-xml';
import { qti2html5 } from '../lib/qti-to-html5/qti-to-html5';

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
  itemXML;
};

/**
 * Fetches manifest data for a given package URI.
 * @param packageUri The URI of the package to fetch manifest data for.
 * @returns A Promise that resolves to a ManifestData object.
 */
export const fetchItem = async (packageUri: string, index: number): Promise<ManifestData> => {
  packageUri = packageUri.endsWith('/') ? packageUri : packageUri + '/';
  const assessmentTestHref = `depitems/assessment-test.xml`;
  const items = await itemsFromAssessmentTest(packageUri + assessmentTestHref);
  const itemLocation = `${packageUri}${assessmentTestHref.substring(0, assessmentTestHref.lastIndexOf('/'))}/`;
  const itemXML = await requestItem(`${itemLocation}${items[index].href}`);
  const itemHTML = qti2html5(itemXML, itemLocation);
  return { itemXML: itemHTML, itemLocation, items, testIdentifier: 'assessment-test'! };
};
