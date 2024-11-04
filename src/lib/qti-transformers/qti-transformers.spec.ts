const xml = String.raw;
const html = String.raw;

import { qtiTransformItem, qtiTransformTest } from './qti-transformers';

describe('qtiTransformTest', () => {
  it('should return an object with the expected methods', async () => {
    const parsedXML = qtiTransformTest()
      .parse(
        xml`
    <qti-assessment-test>
      <qti-assessment-item-ref identifier="ITM-choice" href="items/choice.xml" />
      <qti-assessment-item-ref identifier="ITM-text" href="items/text.xml" />
    </qti-assessment-test>`
      )
      .html();

    expect(parsedXML).toMatch(
      html`
<qti-assessment-test xmlns="http://www.w3.org/1999/xhtml">
      <qti-assessment-item-ref identifier="ITM-choice" href="items/choice.xml"></qti-assessment-item-ref>
      <qti-assessment-item-ref identifier="ITM-text" href="items/text.xml"></qti-assessment-item-ref>
    </qti-assessment-test>`
    );
  });
});

describe('qtiTransformItem', () => {
  it('should return an object with the expected methods', async () => {
    const parsedXML = qtiTransformItem()
      .parse(
        xml`
    <qti-assessment-item>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE" class="type:custom">
            <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
            <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
          </qti-choice-interaction>
        </qti-item-body>
    </qti-assessment-item>`
      ).customTypes()
      .html();

    expect(parsedXML).toMatch(
      html`
<qti-assessment-item xmlns="http://www.w3.org/1999/xhtml">
        <qti-item-body>
          <qti-choice-interaction-custom response-identifier="RESPONSE" class="type:custom">
            <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
            <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
          </qti-choice-interaction-custom>
        </qti-item-body>
    </qti-assessment-item>`
    );
  });
});
