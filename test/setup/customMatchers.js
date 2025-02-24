import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { expect } from 'vitest';

export const customMatchers = {
  toEqualXml(received, expected) {
    const parser = new XMLParser({
      ignoreAttributes: false,
      trimValues: true
    });

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true // Prettify the output for readability
    });

    const receivedObj = parser.parse(received);
    const expectedObj = parser.parse(expected);

    const pass = this.equals(receivedObj, expectedObj);

    if (pass) {
      return {
        message: () => `expected XML not to be equal`,
        pass: true
      };
    } else {
      // Convert JSON objects back to XML strings
      const receivedXml = builder.build(receivedObj);
      const expectedXml = builder.build(expectedObj);

      return {
        message: () => `Expected XML structures to be equal:\n\nReceived:\n${receivedXml}\n\nExpected:\n${expectedXml}`,
        pass: false
      };
    }
  },
  toNotEqualXml(received, expected) {
    const parser = new XMLParser({
      ignoreAttributes: false,
      trimValues: true
    });

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true // Prettify the output for readability
    });

    const receivedObj = parser.parse(received);
    const expectedObj = parser.parse(expected);

    const pass = this.equals(receivedObj, expectedObj);

    if (!pass) {
      return {
        message: () => `expected XML to be equal`,
        pass: true
      };
    } else {
      // Convert JSON objects back to XML strings
      const receivedXml = builder.build(receivedObj);
      return {
        message: () => `Expected XML structures to be not equal:\n\nReceived:\n${receivedXml}`,
        pass: false
      };
    }
  }
};

expect.extend(customMatchers);
