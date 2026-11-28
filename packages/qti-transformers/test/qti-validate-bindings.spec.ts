import { qtiTransformItem } from '../src/qti-transform-item';

/** An item with one declaration and one interaction bound to it. */
const item = (declaration: string, interaction: string) =>
  `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="item1" title="Item">
    ${declaration}
    <qti-item-body>${interaction}</qti-item-body>
  </qti-assessment-item>`;

const validate = (xml: string) => () => qtiTransformItem().parse(xml).validateBindings();

const inlineChoice = (cardinality: string) =>
  item(
    `<qti-response-declaration identifier="RESPONSE" cardinality="${cardinality}" base-type="identifier"/>`,
    `<p><qti-inline-choice-interaction response-identifier="RESPONSE">
       <qti-inline-choice identifier="A">A</qti-inline-choice>
     </qti-inline-choice-interaction></p>`
  );

describe('validateBindings()', () => {
  it('accepts an interaction bound as the information model says', () => {
    expect(validate(inlineChoice('single'))).not.toThrow();
  });

  it('rejects a cardinality the interaction does not permit (Q12 inline-choice-invalid)', () => {
    expect(validate(inlineChoice('multiple'))).toThrow(
      'QTI validation error: qti-inline-choice-interaction (response "RESPONSE"): multiple cardinality is not permitted; it must be single.'
    );
  });

  it('rejects a base-type the interaction does not permit', () => {
    const xml = item(
      '<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string"/>',
      '<qti-choice-interaction response-identifier="RESPONSE"><qti-simple-choice identifier="A">A</qti-simple-choice></qti-choice-interaction>'
    );
    expect(validate(xml)).toThrow('base-type string is not permitted; it must be identifier');
  });

  it('requires multiple cardinality when the maximum is greater than 1', () => {
    const xml = item(
      '<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"/>',
      '<qti-choice-interaction response-identifier="RESPONSE" max-choices="2"><qti-simple-choice identifier="A">A</qti-simple-choice></qti-choice-interaction>'
    );
    expect(validate(xml)).toThrow('max-choices 2 requires multiple cardinality, not single');
  });

  it('applies the maximum default: 1 for match, which allows single', () => {
    const xml = item(
      '<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="directedPair"/>',
      '<qti-match-interaction response-identifier="RESPONSE"><qti-simple-match-set/><qti-simple-match-set/></qti-match-interaction>'
    );
    expect(validate(xml)).not.toThrow();
  });

  it('applies the maximum default: 0 (unlimited) for select point, which requires multiple', () => {
    const xml = item(
      '<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="point"/>',
      '<qti-select-point-interaction response-identifier="RESPONSE"/>'
    );
    expect(validate(xml)).toThrow('max-choices 0 requires multiple cardinality, not single');
  });

  it('does not check the base-type of a record', () => {
    const xml = item(
      '<qti-response-declaration identifier="RESPONSE" cardinality="record"/>',
      '<p><qti-text-entry-interaction response-identifier="RESPONSE"/></p>'
    );
    expect(validate(xml)).not.toThrow();
  });

  it('lists every violation in one error', () => {
    const xml = item(
      `<qti-response-declaration identifier="R1" cardinality="multiple" base-type="identifier"/>
       <qti-response-declaration identifier="R2" cardinality="single" base-type="string"/>`,
      `<p><qti-inline-choice-interaction response-identifier="R1"><qti-inline-choice identifier="A">A</qti-inline-choice></qti-inline-choice-interaction></p>
       <qti-upload-interaction response-identifier="R2"/>`
    );
    expect(validate(xml)).toThrow(
      'QTI validation error: qti-inline-choice-interaction (response "R1"): multiple cardinality is not permitted; it must be single; qti-upload-interaction (response "R2"): base-type string is not permitted; it must be file.'
    );
  });

  it('leaves an interaction alone when its response is not declared', () => {
    expect(validate(item('', '<qti-upload-interaction response-identifier="RESPONSE"/>'))).not.toThrow();
  });

  it('is not run by parse() or load() themselves', () => {
    expect(() => qtiTransformItem().parse(inlineChoice('multiple'))).not.toThrow();
  });
});
