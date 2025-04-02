const xml = String.raw;
const html = String.raw;

import { qtiTransformItem } from './qti-transform-item';

describe('qtiTransformItem API Methods', () => {
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
    const parsedXML = qtiTransformItem()
      .parse(
        xml`
        <qti-assessment-item>
          <qti-item-body>
            <qti-choice-interaction shuffle="true">
              <qti-simple-choice identifier="A">Optie A</qti-simple-choice>
              <qti-simple-choice identifier="B">Optie B</qti-simple-choice>
              <qti-simple-choice identifier="C">Optie C</qti-simple-choice>
            </qti-choice-interaction>
          </qti-item-body>
        </qti-assessment-item>`
      )
      .shuffleInteractions()
      .html();

    expect(parsedXML).not.toEqualXml(
      html`<qti-assessment-item>
        <qti-item-body>
          <qti-choice-interaction shuffle="true">
            <qti-simple-choice identifier="A">Optie A</qti-simple-choice>
            <qti-simple-choice identifier="B">Optie B</qti-simple-choice>
            <qti-simple-choice identifier="C">Optie C</qti-simple-choice>
          </qti-choice-interaction>
        </qti-item-body>
      </qti-assessment-item>`
    );
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
      .promise.then(api => {
        console.log('api', api.html());
        return api.html();
        // .path(``)
      });

    expect(parsedXML).toEqualXml(
      html` <qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
        <qti-item-body>
          <img src="/assets/qti-path-conversion//assets/qti-path-conversion//path/to/image.jpg" />
        </qti-item-body>
      </qti-assessment-item>`
    );
  });
});
