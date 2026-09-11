/**
 * `DOMParser.parseFromString` never throws for `text/xml` — it returns a *document describing the
 * failure*, whose root is an HTML page reading "This page contains the following errors…". Nothing
 * downstream told that apart from a real item, so `toHTML` copied the error page into the DOM and
 * the player rendered the browser's parse error as the item, past every try/catch, because nothing
 * ever threw.
 *
 * A leading blank line in front of `<?xml` is the case that surfaced it: fatal to the letter of the
 * XML spec, and one of the most common artefacts of an item that has been through an editor or a
 * copy and paste. That one is now tolerated; everything genuinely malformed is reported.
 */
import { qtiTransformItem } from '../src/qti-transform-item';
import { qtiTransformTest } from '../src/qti-transform-test';

const declaration = '<?xml version="1.0" encoding="UTF-8"?>';
const item = `${declaration}
<qti-assessment-item identifier="item1" title="Item"><qti-item-body><p>hello</p></qti-item-body></qti-assessment-item>`;

const renderedText = (xml: string): string => {
  const host = document.createElement('div');
  host.appendChild(qtiTransformItem().parse(xml).htmlDoc());
  return (host.textContent || '').replace(/\s+/g, ' ').trim();
};

describe('parsing a malformed item', () => {
  it('throws instead of handing back the browser error document', () => {
    expect(() => qtiTransformItem().parse('<qti-assessment-item><unclosed></qti-assessment-item>')).toThrow(
      /Failed to parse XML/
    );
  });

  it('carries the parser message, so the author can find the line', () => {
    let message = '';
    try {
      qtiTransformItem().parse('<qti-assessment-item><unclosed></qti-assessment-item>');
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/line/i);
  });

  it('never renders the browser error page as the item', () => {
    expect(() => renderedText('<qti-assessment-item><unclosed></qti-assessment-item>')).toThrow();
  });

  it('reports a malformed test too', () => {
    expect(() => qtiTransformTest().parse('<qti-assessment-test><unclosed>')).toThrow(/Failed to parse XML/);
  });

  it('rejects a load() whose body is not well-formed', async () => {
    const fetchMock = vi.fn(async () => new Response('<qti-assessment-item><unclosed>', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    try {
      await expect(qtiTransformItem().load('https://example.com/items/i1.xml')).rejects.toThrow(
        /Failed to load XML: is not well-formed XML/
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('tolerating leading whitespace before the declaration', () => {
  // The reported case: an item that reaches the player with one blank line in front of `<?xml`.
  it.each([
    ['a leading newline', `\n${item}`],
    ['a blank line and indentation', `\n     ${item}`],
    ['leading spaces', `   ${item}`],
    ['a BOM', `\uFEFF${item}`],
    ['a BOM and a newline', `\uFEFF\n${item}`]
  ])('parses an item with %s', (_label, xml) => {
    expect(renderedText(xml)).toBe('hello');
  });

  it('leaves a well-formed item alone', () => {
    expect(renderedText(item)).toBe('hello');
  });

  it('does not swallow an item that is malformed after the whitespace', () => {
    expect(() => qtiTransformItem().parse(`\n${declaration}\n<qti-assessment-item><unclosed>`)).toThrow(
      /Failed to parse XML/
    );
  });
});

describe('an item that legitimately mentions parsererror', () => {
  // Matched by the error document's namespace, not by tag name, so item content cannot fake it.
  it('is not mistaken for a parse failure', () => {
    const xml = `${declaration}
<qti-assessment-item identifier="item1" title="Item"><qti-item-body><parsererror>not an error</parsererror></qti-item-body></qti-assessment-item>`;
    expect(renderedText(xml)).toBe('not an error');
  });
});
