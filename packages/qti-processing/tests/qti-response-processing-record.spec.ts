import '@citolab/qti-components';

import { html, render } from 'lit';

import type { ResponseVariable } from '@qti-components/base';
import type { QtiAssessmentItem } from '@qti-components/elements';

/*
 * A response with record cardinality, as a PCI binds one: "stop the video and click the frame".
 * The fields are read with qti-field-value, compared as a float (time) and tested as a point
 * (point). Based on ITM-stop-video.xml; the PCI itself is left out, scoring is what is tested.
 */
const stopVideoItem = (withCorrectResponse: boolean) =>
  html`<qti-assessment-item
    xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
    identifier="ITM-stop-video"
    title="Stop the video"
    adaptive="false"
    time-dependent="false"
  >
    <qti-response-declaration identifier="RESPONSE" cardinality="record">
      ${withCorrectResponse
        ? html`<qti-correct-response>
            <qti-value field-identifier="time" base-type="float">4.0</qti-value>
            <qti-value field-identifier="point" base-type="point">460 245</qti-value>
          </qti-correct-response>`
        : null}
    </qti-response-declaration>
    <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
      <qti-default-value>
        <qti-value>0</qti-value>
      </qti-default-value>
    </qti-outcome-declaration>
    <qti-item-body>
      <p>Pause the video once you can see the yellow stamens inside the flower, then click on them.</p>
    </qti-item-body>
    <qti-response-processing>
      <qti-response-condition>
        <qti-response-if>
          <qti-and>
            <qti-gte>
              <qti-field-value field-identifier="time">
                <qti-variable identifier="RESPONSE"></qti-variable>
              </qti-field-value>
              <qti-base-value base-type="float">3.0</qti-base-value>
            </qti-gte>
            <qti-lte>
              <qti-field-value field-identifier="time">
                <qti-variable identifier="RESPONSE"></qti-variable>
              </qti-field-value>
              <qti-base-value base-type="float">5.1</qti-base-value>
            </qti-lte>
            <qti-inside shape="circle" coords="460,245,60">
              <qti-field-value field-identifier="point">
                <qti-variable identifier="RESPONSE"></qti-variable>
              </qti-field-value>
            </qti-inside>
          </qti-and>
          <qti-set-outcome-value identifier="SCORE">
            <qti-base-value base-type="float">1</qti-base-value>
          </qti-set-outcome-value>
        </qti-response-if>
        <qti-response-else-if>
          <qti-and>
            <qti-gte>
              <qti-field-value field-identifier="time">
                <qti-variable identifier="RESPONSE"></qti-variable>
              </qti-field-value>
              <qti-base-value base-type="float">3.0</qti-base-value>
            </qti-gte>
            <qti-lte>
              <qti-field-value field-identifier="time">
                <qti-variable identifier="RESPONSE"></qti-variable>
              </qti-field-value>
              <qti-base-value base-type="float">5.1</qti-base-value>
            </qti-lte>
          </qti-and>
          <qti-set-outcome-value identifier="SCORE">
            <qti-base-value base-type="float">0.5</qti-base-value>
          </qti-set-outcome-value>
        </qti-response-else-if>
      </qti-response-condition>
    </qti-response-processing>
  </qti-assessment-item>`;

describe('response processing over a record response', () => {
  let item: QtiAssessmentItem;

  beforeEach(async () => {
    render(stopVideoItem(true), document.body);
    item = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await item.updateComplete;
  });

  afterEach(() => {
    render(html``, document.body);
  });

  const score = (response: Record<string, string> | null) => {
    // A record response is stored as its field map of QTI string literals.
    item.updateResponseVariable('RESPONSE', response as unknown as string);
    item.processResponse();
    return +item.getOutcome('SCORE').value;
  };

  it('parses the record correct response into a field map with the declared field base types', () => {
    const response = item.itemContext.variables.find(v => v.identifier === 'RESPONSE') as ResponseVariable;
    expect(response.cardinality).toBe('record');
    expect(response.correctResponse).toEqual({ time: '4.0', point: '460 245' });
    expect(response.fieldBaseTypes).toEqual({ time: 'float', point: 'point' });
  });

  it('scores 1 when the time is in the window and the point inside the area', () => {
    expect(score({ time: '4.1', point: '455 250' })).toBe(1);
  });

  it('scores 0.5 when only the time is right', () => {
    expect(score({ time: '4.1', point: '100 100' })).toBe(0.5);
  });

  it('scores 0 when the time is outside the window', () => {
    expect(score({ time: '1', point: '455 250' })).toBe(0);
  });

  it('scores 0 for a record that lacks the time field', () => {
    expect(score({ point: '455 250' })).toBe(0);
  });

  it('scores 0 for no response at all', () => {
    expect(score(null)).toBe(0);
  });

  it('scores the correct response itself as 1', () => {
    const response = item.itemContext.variables.find(v => v.identifier === 'RESPONSE') as ResponseVariable;
    expect(score(response.correctResponse as unknown as Record<string, string>)).toBe(1);
  });
});

describe('response processing over a record response without declared field types', () => {
  let item: QtiAssessmentItem;

  beforeEach(async () => {
    render(stopVideoItem(false), document.body);
    item = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await item.updateComplete;
  });

  afterEach(() => {
    render(html``, document.body);
  });

  const score = (response: Record<string, string>) => {
    item.updateResponseVariable('RESPONSE', response as unknown as string);
    item.processResponse();
    return +item.getOutcome('SCORE').value;
  };

  it('reads a numeric field as a float and an "x y" field as a point', () => {
    expect(score({ time: '4.1', point: '455 250' })).toBe(1);
    expect(score({ time: '4.1', point: '100 100' })).toBe(0.5);
    expect(score({ time: '1', point: '455 250' })).toBe(0);
  });
});

/*
 * The same item in the shape qti-construction's score model generates: two findings of 0.5 each,
 * summed into SCORE (the current ITM-stop-video.xml).
 */
const stopVideoFindingsItem = html`<qti-assessment-item
  xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
  identifier="ITM-stop-video"
  title="Stop the video"
  adaptive="false"
  time-dependent="false"
>
  <qti-response-declaration identifier="RESPONSE" cardinality="record">
    <qti-correct-response>
      <qti-value field-identifier="time" base-type="float">4.0</qti-value>
      <qti-value field-identifier="point" base-type="point">460 245</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value><qti-value>0</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-outcome-declaration identifier="SCOREFINDING_1" cardinality="single" base-type="float">
    <qti-default-value><qti-value>0</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-outcome-declaration identifier="SCOREFINDING_2" cardinality="single" base-type="float">
    <qti-default-value><qti-value>0</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body><p>Stop the video.</p></qti-item-body>
  <qti-response-processing>
    <qti-response-condition>
      <qti-response-if>
        <qti-and>
          <qti-gte>
            <qti-field-value field-identifier="time"
              ><qti-variable identifier="RESPONSE"></qti-variable
            ></qti-field-value>
            <qti-base-value base-type="float">3</qti-base-value>
          </qti-gte>
          <qti-lte>
            <qti-field-value field-identifier="time"
              ><qti-variable identifier="RESPONSE"></qti-variable
            ></qti-field-value>
            <qti-base-value base-type="float">5.1</qti-base-value>
          </qti-lte>
        </qti-and>
        <qti-set-outcome-value identifier="SCOREFINDING_1">
          <qti-base-value base-type="float">0.5</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-if>
    </qti-response-condition>
    <qti-response-condition>
      <qti-response-if>
        <qti-and>
          <qti-and>
            <qti-gte>
              <qti-field-value field-identifier="time"
                ><qti-variable identifier="RESPONSE"></qti-variable
              ></qti-field-value>
              <qti-base-value base-type="float">3</qti-base-value>
            </qti-gte>
            <qti-lte>
              <qti-field-value field-identifier="time"
                ><qti-variable identifier="RESPONSE"></qti-variable
              ></qti-field-value>
              <qti-base-value base-type="float">5.1</qti-base-value>
            </qti-lte>
          </qti-and>
          <qti-inside shape="circle" coords="460,245,60">
            <qti-field-value field-identifier="point"
              ><qti-variable identifier="RESPONSE"></qti-variable
            ></qti-field-value>
          </qti-inside>
        </qti-and>
        <qti-set-outcome-value identifier="SCOREFINDING_2">
          <qti-base-value base-type="float">0.5</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-if>
    </qti-response-condition>
    <qti-set-outcome-value identifier="SCORE">
      <qti-sum>
        <qti-variable identifier="SCOREFINDING_1"></qti-variable>
        <qti-variable identifier="SCOREFINDING_2"></qti-variable>
      </qti-sum>
    </qti-set-outcome-value>
  </qti-response-processing>
</qti-assessment-item>`;

describe('response processing over a record response, scored by findings', () => {
  let item: QtiAssessmentItem;

  beforeEach(async () => {
    render(stopVideoFindingsItem, document.body);
    item = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await item.updateComplete;
  });

  afterEach(() => {
    render(html``, document.body);
  });

  const score = (response: Record<string, string>) => {
    item.updateResponseVariable('RESPONSE', response as unknown as string);
    item.processResponse();
    return +item.getOutcome('SCORE').value;
  };

  it('sums the findings: 1, 0.5 or 0', () => {
    expect(score({ time: '4.1', point: '455 250' })).toBe(1);
    expect(score({ time: '4.1', point: '100 100' })).toBe(0.5);
    expect(score({ time: '1', point: '455 250' })).toBe(0);
  });
});

/*
 * A comparison with NULL is NULL, and NULL is false in a condition. "+null" is 0 in JavaScript, so
 * without a NULL check `lte(NULL, 5.1)` came out true: a missing field (or no response) passed it.
 */
const compareItem = (op: string, cardinality: 'record' | 'single') =>
  html`<qti-assessment-item
    xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
    identifier="ITM-compare"
    title="Compare"
  >
    ${cardinality === 'record'
      ? html`<qti-response-declaration identifier="RESPONSE" cardinality="record"></qti-response-declaration>`
      : html`<qti-response-declaration
          identifier="RESPONSE"
          cardinality="single"
          base-type="float"
        ></qti-response-declaration>`}
    <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
      <qti-default-value><qti-value>0</qti-value></qti-default-value>
    </qti-outcome-declaration>
    <qti-item-body></qti-item-body>
    <qti-response-processing>
      <qti-response-condition>
        <qti-response-if>
          ${op === 'gt'
            ? html`<qti-gt>${operand(cardinality)}<qti-base-value base-type="float">-1</qti-base-value></qti-gt>`
            : op === 'gte'
              ? html`<qti-gte>${operand(cardinality)}<qti-base-value base-type="float">-1</qti-base-value></qti-gte>`
              : op === 'lt'
                ? html`<qti-lt>${operand(cardinality)}<qti-base-value base-type="float">5</qti-base-value></qti-lt>`
                : html`<qti-lte>${operand(cardinality)}<qti-base-value base-type="float">5</qti-base-value></qti-lte>`}
          <qti-set-outcome-value identifier="SCORE"
            ><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value
          >
        </qti-response-if>
      </qti-response-condition>
    </qti-response-processing>
  </qti-assessment-item>`;

const operand = (cardinality: 'record' | 'single') =>
  cardinality === 'record'
    ? html`<qti-field-value field-identifier="time"
        ><qti-variable identifier="RESPONSE"></qti-variable
      ></qti-field-value>`
    : html`<qti-variable identifier="RESPONSE"></qti-variable>`;

describe('a comparison with NULL is false', () => {
  afterEach(() => {
    render(html``, document.body);
  });

  const score = async (op: string, cardinality: 'record' | 'single', response: unknown) => {
    render(html``, document.body); // a fresh item: lit would otherwise reuse the element with its old declaration
    render(compareItem(op, cardinality), document.body);
    const item = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await item.updateComplete;
    item.updateResponseVariable('RESPONSE', response as string);
    item.processResponse();
    return +item.getOutcome('SCORE').value;
  };

  for (const op of ['gt', 'gte', 'lt', 'lte']) {
    it(`${op}: a field the record lacks`, async () => {
      expect(await score(op, 'record', { point: '455 250' })).toBe(0);
    });

    it(`${op}: a record without a response`, async () => {
      expect(await score(op, 'record', null)).toBe(0);
    });

    it(`${op}: a single response without a value`, async () => {
      expect(await score(op, 'single', null)).toBe(0);
    });

    it(`${op}: still true for a value that passes`, async () => {
      expect(await score(op, 'record', { time: '4.1' })).toBe(1);
      expect(await score(op, 'single', '4.1')).toBe(1);
    });
  }
});
