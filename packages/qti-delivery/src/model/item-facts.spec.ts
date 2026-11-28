import { DOMParser } from '@xmldom/xmldom';
import { describe, expect, it } from 'vitest';

import { readItemFacts } from './item-facts';

import type { XmlElement } from './xml-node';

const parse = (xml: string) =>
  new DOMParser().parseFromString(xml, 'text/xml').documentElement as unknown as XmlElement;

const item = (attributes: string, body = '') =>
  parse(
    `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" ${attributes}>${body}</qti-assessment-item>`
  );

/* Runs in the `node` vitest project: the facts come from the XML with xmldom, no browser. */
describe('readItemFacts', () => {
  it('refuses an element that is not a qti-assessment-item', () => {
    expect(() => readItemFacts(parse('<qti-assessment-test identifier="t"/>'))).toThrow(TypeError);
  });

  it('gives the defaults for an item that declares nothing', () => {
    expect(readItemFacts(item('identifier="i"'))).toEqual({
      identifier: 'i',
      adaptive: false,
      timeDependent: false,
      hasCorrectResponse: false,
      hasResponseProcessing: false,
      externalScored: null,
      label: null,
      title: ''
    });
  });

  it('reads the item attributes', () => {
    expect(
      readItemFacts(item('identifier="i" title="T" label="L" adaptive="true" time-dependent="true"'))
    ).toMatchObject({ identifier: 'i', title: 'T', label: 'L', adaptive: true, timeDependent: true });
  });

  it('reads external-scored off the SCORE outcome declaration only', () => {
    const facts = (scoreAttribute: string) =>
      readItemFacts(
        item(
          'identifier="i"',
          `<qti-outcome-declaration identifier="OTHER" cardinality="single" base-type="float" external-scored="externalMachine"/>
           <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float" ${scoreAttribute}/>`
        )
      ).externalScored;
    expect(facts('external-scored="human"')).toBe('human');
    expect(facts('external-scored="externalMachine"')).toBe('externalMachine');
    expect(facts('')).toBeNull();
  });

  it.each([
    ['a correct response', '<qti-correct-response><qti-value>A</qti-value></qti-correct-response>', true],
    ['a mapping with an entry', '<qti-mapping><qti-map-entry map-key="A" mapped-value="1"/></qti-mapping>', true],
    [
      'an area mapping with an entry',
      '<qti-area-mapping><qti-area-map-entry shape="circle" coords="1,1,1" mapped-value="1"/></qti-area-mapping>',
      true
    ],
    ['an empty mapping', '<qti-mapping default-value="0"/>', false],
    ['nothing', '', false]
  ])('has a correct response with %s', (_name, content, expected) => {
    const xml = `<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">${content}</qti-response-declaration>`;
    expect(readItemFacts(item('identifier="i"', xml)).hasCorrectResponse).toBe(expected);
  });

  it('sees response processing', () => {
    const xml =
      '<qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml"/>';
    expect(readItemFacts(item('identifier="i"', xml)).hasResponseProcessing).toBe(true);
  });
});
