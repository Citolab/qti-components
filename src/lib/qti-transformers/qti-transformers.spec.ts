const xml = String.raw;
const html = String.raw;

import { qtiTransformTest } from './qti-transformers';

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

    expect(parsedXML).toMatch(`
<qti-assessment-test xmlns="http://www.w3.org/1999/xhtml">
      <qti-assessment-item-ref identifier="ITM-choice" href="items/choice.xml"></qti-assessment-item-ref>
      <qti-assessment-item-ref identifier="ITM-text" href="items/text.xml"></qti-assessment-item-ref>
    </qti-assessment-test>`);
  });
});
