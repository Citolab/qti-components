const xml = String.raw;
const html = String.raw;

import { afterEach, vi } from 'vitest';

import { qtiTransformItem } from '../src/qti-transform-item';

const shuffledLoadItem = xml`
  <qti-assessment-item identifier="ITM-LOAD">
    <qti-item-body>
      <qti-choice-interaction response-identifier="RESPONSE" shuffle="true">
        <qti-simple-choice identifier="A">Optie A</qti-simple-choice>
        <qti-simple-choice identifier="B">Optie B</qti-simple-choice>
        <qti-simple-choice identifier="C">Optie C</qti-simple-choice>
        <qti-simple-choice identifier="D">Optie D</qti-simple-choice>
      </qti-choice-interaction>
    </qti-item-body>
  </qti-assessment-item>`;

const choiceIdentifiers = (doc: XMLDocument): string[] =>
  Array.from(doc.querySelectorAll('qti-simple-choice')).map(choice => choice.getAttribute('identifier') ?? '');

const mockXmlFetch = (body: string) => {
  const fetchMock = vi.fn(async () => new Response(body, { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('qtiTransformItem API Methods', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it('should apply customInteraction correctly', async () => {
    const parsedXML = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item>
          <qti-item-body>
            <qti-custom-interaction>
              <object data="baseData" width="400" height="300"></object>
            </qti-custom-interaction>
          </qti-item-body>
        </qti-assessment-item>`
      )
      .customInteraction('baseRef', 'item123')
      .html();

    expect(parsedXML).toEqualXml(
      html` <qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
        <qti-item-body>
          <qti-custom-interaction
            data-base-ref="baseRef"
            data-base-item="baseRefitem123"
            data="baseData"
            width="400"
            height="300"
          ></qti-custom-interaction>
        </qti-item-body>
      </qti-assessment-item>`
    );
  });

  it('should convert CDATA sections to comments', async () => {
    const parsedXML = qtiTransformItem()
      .parse(
        xml`
<qti-assessment-item>
  <qti-item-body>
    <qti-custom-operator class="js.org">
      <qti-base-value><![CDATA[some CDATA content]]></qti-base-value>
    </qti-custom-operator>
  </qti-item-body>
</qti-assessment-item>`
      )
      .convertCDATAtoComment()
      .html();

    expect(parsedXML).toEqualXml(
      html`<qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
        <qti-item-body>
          <qti-custom-operator class="js.org">
            <qti-base-value><!--some CDATA content--></qti-base-value>
          </qti-custom-operator>
        </qti-item-body>
      </qti-assessment-item>`
    );
  });

  it('should strip style sheets from the document', async () => {
    const parsedXML = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item>
          <qti-stylesheet href="style.css" />
          <qti-item-body>
            <qti-choice-interaction response-identifier="RESPONSE">
              <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
              <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
            </qti-choice-interaction>
          </qti-item-body>
        </qti-assessment-item>`
      )
      .stripStyleSheets()
      .html();

    expect(parsedXML).toEqualXml(
      html` <qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE">
            <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
            <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
          </qti-choice-interaction>
        </qti-item-body>
      </qti-assessment-item>`
    );
  });

  it('should preserve MathML namespaces when converting to HTML', async () => {
    const htmlDoc = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xmlns:m="http://www.w3.org/1998/Math/MathML">
          <qti-item-body>
            <qti-prompt>
              mathml:
              <m:math display="inline">
                <m:semantics>
                  <m:mfrac>
                    <m:mn>1</m:mn>
                    <m:msqrt>
                      <m:mn>2</m:mn>
                    </m:msqrt>
                  </m:mfrac>
                </m:semantics>
              </m:math>
            </qti-prompt>
          </qti-item-body>
        </qti-assessment-item>`
      )
      .htmlDoc();

    const elements = Array.from(htmlDoc.querySelectorAll('*'));
    const qtiItem = elements.find(element => element.localName === 'qti-assessment-item');
    const math = elements.find(element => element.localName === 'math');
    const fraction = elements.find(element => element.localName === 'mfrac');
    const squareRoot = elements.find(element => element.localName === 'msqrt');

    expect(qtiItem?.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
    expect(math?.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML');
    expect(math?.getAttribute('display')).toBe('inline');
    expect(fraction?.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML');
    expect(squareRoot?.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML');
  });

  it('should update elements with pciHooks correctly', async () => {
    const parsedXML = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item>
          <qti-item-body>
            <qti-custom-interaction hook="customHook" module="customModule" />
          </qti-item-body>
        </qti-assessment-item>`
      )
      .pciHooks('https://example.com/path')
      .html();

    expect(parsedXML).toEqualXml(
      html` <qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
        <qti-item-body>
          <qti-custom-interaction
            hook="customHook"
            module="https://example.com/customHook.js"
            base-url="https://example.com/path"
          ></qti-custom-interaction>
        </qti-item-body>
      </qti-assessment-item>`
    );
  });

  it('choice should shuffle', async () => {
    const sourceXml = xml`
        <qti-assessment-item>
          <qti-item-body>
            <qti-choice-interaction shuffle="true">
              <qti-simple-choice identifier="A">Optie A</qti-simple-choice>
              <qti-simple-choice identifier="B">Optie B</qti-simple-choice>
              <qti-simple-choice identifier="C">Optie C</qti-simple-choice>
            </qti-choice-interaction>
          </qti-item-body>
        </qti-assessment-item>`;
    const original = ['A', 'B', 'C'];
    const shuffledOrders = [0, 1, 2, 3, 4].map(seed =>
      choiceIdentifiers(qtiTransformItem().parse(sourceXml).shuffleInteractions(seed).xmlDoc())
    );

    expect(shuffledOrders.some(order => JSON.stringify(order) !== JSON.stringify(original))).toBe(true);
  });

  it('does not shuffle interactions on load by default', async () => {
    mockXmlFetch(shuffledLoadItem);

    const transformer = await qtiTransformItem().load('/item.xml');
    const interaction = transformer.xmlDoc().querySelector('qti-choice-interaction');

    expect(choiceIdentifiers(transformer.xmlDoc())).toEqual(['A', 'B', 'C', 'D']);
    expect(interaction?.getAttribute('shuffle')).toBe('true');
  });

  it('applies deterministic shuffle when explicitly chained after load', async () => {
    const fetchMock = mockXmlFetch(shuffledLoadItem);

    const first = (await qtiTransformItem().load('/item.xml')).shuffleInteractions('seeded-load');
    const second = (await qtiTransformItem().load('/item.xml')).shuffleInteractions('seeded-load');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(first.xmlDoc().querySelector('qti-choice-interaction')?.hasAttribute('shuffle')).toBe(false);
    expect(choiceIdentifiers(first.xmlDoc())).toEqual(choiceIdentifiers(second.xmlDoc()));
  });

  it('shuffle fixed p1', async () => {
    const parsedXML = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item>
          <qti-item-body>
            <qti-choice-interaction shuffle="true">
              <qti-simple-choice fixed="true" identifier="A">Optie A</qti-simple-choice>
              <qti-simple-choice identifier="B">Optie B</qti-simple-choice>
              <qti-simple-choice identifier="C">Optie C</qti-simple-choice>
            </qti-choice-interaction>
          </qti-item-body>
        </qti-assessment-item>`
      )
      .shuffleInteractions();

    const choices = parsedXML.xmlDoc().querySelectorAll('qti-simple-choice');
    expect(choices[0].getAttribute('fixed')).toBe('true');
    expect(choices[1].hasAttribute('fixed')).toBe(false);
    expect(choices[2].hasAttribute('fixed')).toBe(false);
    expect(choices[0].textContent).toBe('Optie A');
  });

  it('shuffle fixed p2', async () => {
    const parsedXML = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item>
          <qti-item-body>
            <qti-choice-interaction shuffle="true">
              <qti-simple-choice identifier="A">Optie A</qti-simple-choice>
              <qti-simple-choice fixed="true" identifier="B">Optie B</qti-simple-choice>
              <qti-simple-choice identifier="C">Optie C</qti-simple-choice>
            </qti-choice-interaction>
          </qti-item-body>
        </qti-assessment-item>`
      )
      .shuffleInteractions();

    const choices = parsedXML.xmlDoc().querySelectorAll('qti-simple-choice');
    expect(choices[0].hasAttribute('fixed')).toBe(false);
    expect(choices[1].getAttribute('fixed')).toBe('true');
    expect(choices[2].hasAttribute('fixed')).toBe(false);
    expect(choices[1].textContent).toBe('Optie B');
  });

  it('shuffle fixed p3', async () => {
    const parsedXML = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item>
          <qti-item-body>
            <qti-choice-interaction shuffle="true">
              <qti-simple-choice identifier="A">Optie A</qti-simple-choice>
              <qti-simple-choice identifier="B">Optie B</qti-simple-choice>
              <qti-simple-choice fixed="true"  identifier="C">Optie C</qti-simple-choice>
            </qti-choice-interaction>
          </qti-item-body>
        </qti-assessment-item>`
      )
      .shuffleInteractions();

    const choices = parsedXML.xmlDoc().querySelectorAll('qti-simple-choice');

    expect(choices[0].hasAttribute('fixed')).toBe(false);
    expect(choices[1].hasAttribute('fixed')).toBe(false);
    expect(choices[2].getAttribute('fixed')).toBe('true');
    expect(choices[2].textContent).toBe('Optie C');
  });

  it('should extend element names with specified suffix correctly', async () => {
    const parsedXML = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item>
          <qti-item-body>
            <qti-choice-interaction response-identifier="RESPONSE">
              <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
              <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
            </qti-choice-interaction>
          </qti-item-body>
        </qti-assessment-item>`
      )
      .extendElementName('qti-choice-interaction', 'extended')
      .html();

    expect(parsedXML).toEqualXml(
      html` <qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
        <qti-item-body>
          <qti-choice-interaction-extended response-identifier="RESPONSE">
            <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
            <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
          </qti-choice-interaction-extended>
        </qti-item-body>
      </qti-assessment-item>`
    );
  });

  it('should transform relative paths correctly', async () => {
    const parsedXML = await qtiTransformItem()
      .load(`/assets/qti-path-conversion/relative.xml`)
      .then(api => {
        console.log('api', api.html());
        return api.html();
        // .path(``)
      });

    expect(parsedXML).toEqualXml(
      html` <qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
        <qti-item-body>
          <img src="/assets/qti-path-conversion//assets/qti-path-conversion//path/to/image.jpg" />
          <picture>
            <source
              media="(min-width: 768px)"
              srcset="/assets/qti-path-conversion//assets/qti-path-conversion/assets/desktop.png"
            />
            <img
              src="/assets/qti-path-conversion//assets/qti-path-conversion/assets/mobile.png"
              alt="An optimized image that displays nice on mobile, and with more detail on desktop"
            />
          </picture>
          <video poster="/assets/qti-path-conversion//assets/qti-path-conversion/assets/poster.jpg">
            <source src="/assets/qti-path-conversion//assets/qti-path-conversion/movie.mp4" type="video/mp4" />
            <source src="/assets/qti-path-conversion//assets/qti-path-conversion/movie.ogg" type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        </qti-item-body>
      </qti-assessment-item>`
    );
  });
});
