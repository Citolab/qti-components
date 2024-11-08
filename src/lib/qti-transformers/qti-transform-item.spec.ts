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
      html`
      <qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
        <qti-item-body>
          <qti-custom-interaction data-base-ref="baseRef" data-base-item="baseRefitem123" data="baseData" width="400" height="300"></qti-custom-interaction>
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

    expect(parsedXML).toMatch(
      html`
<qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
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
      html`
      <qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
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
      html`
      <qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
        <qti-item-body>
          <qti-custom-interaction hook="customHook" module="https://example.com/customHook.js" base-url="https://example.com/path"></qti-custom-interaction>
        </qti-item-body>
      </qti-assessment-item>`
    );
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
      html`
      <qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
        <qti-item-body>
          <qti-choice-interaction-extended response-identifier="RESPONSE">
            <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
            <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
          </qti-choice-interaction-extended>
        </qti-item-body>
      </qti-assessment-item>`
    );
  });
});
