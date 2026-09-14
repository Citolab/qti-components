import '@citolab/qti-components';

import { describe, it, expect, beforeEach } from 'vitest';
import { html, render } from 'lit';

import type { TemplateResult } from 'lit';
import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiMapResponsePoint } from './qti-map-response-point';

/**
 * The area map from [Citolab/qti-components#83](https://github.com/Citolab/qti-components/issues/83):
 * three city zones worth 1 point each and a `default` catch-all — the whole image — worth 0.5.
 *
 * `default` is what makes the ordering rules observable: it overlaps every other area, so a click on
 * a city falls in two entries at once, and "each area is tested in turn, with those listed first
 * taking priority in the case where areas overlap and a point falls in the intersection"
 * (QTI 3.0 §7.4) is what decides which of the two it scores.
 */
const CITY_ZONES = html`
  <qti-area-map-entry shape="circle" coords="96,114,16" mapped-value="1"></qti-area-map-entry>
  <qti-area-map-entry shape="rect" coords="125,220,145,240" mapped-value="1"></qti-area-map-entry>
  <qti-area-map-entry
    shape="poly"
    coords="85,160,95,155,100,165,95,175,85,170,80,165,85,160"
    mapped-value="1"
  ></qti-area-map-entry>
`;

const WHOLE_IMAGE = html`
  <qti-area-map-entry shape="default" coords="0,0,100%,100%" mapped-value="0.5"></qti-area-map-entry>
`;

/** Declaration order is the thing under test, so the entries are a parameter rather than fixed. */
const template = (areaMapEntries: TemplateResult) => html`
  <qti-assessment-item identifier="uk-map">
    <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="point">
      <qti-area-mapping default-value="0">${areaMapEntries}</qti-area-mapping>
    </qti-response-declaration>

    <qti-map-response-point identifier="RESPONSE"></qti-map-response-point>
  </qti-assessment-item>
`;

/** Points on the 206x280 map: the three cities the prompt names, and one that is in no city zone. */
const EDINBURGH = '96 114'; // the centre of the circle
const LONDON = '135 230'; // inside the rect
const MANCHESTER = '90 165'; // inside the poly
const GLASGOW = '60 120'; // inside no city zone, so only `default` can match it

/**
 * Renders an item with the given entry order and returns a `score(...points)` for it.
 *
 * Each call gets its own container: `qti-response-declaration` snapshots its area mapping in
 * `connectedCallback`, so re-rendering a different entry order into a container lit has already
 * populated would reuse the live element and keep the first order's mapping.
 */
const scorerFor = (areaMapEntries: TemplateResult) => {
  const container = document.createElement('div');
  document.body.replaceChildren(container);
  render(template(areaMapEntries), container);
  const assessmentItem = container.querySelector('qti-assessment-item') as QtiAssessmentItem;
  const mapResponsePoint = container.querySelector('qti-map-response-point') as QtiMapResponsePoint;
  return (...points: string[]) => {
    assessmentItem.updateResponseVariable('RESPONSE', points);
    return mapResponsePoint.getResult();
  };
};

describe('qti-map-response-point', () => {
  // The authoring best practice: specific shapes first, the `default` fallback last.
  describe('with the city zones declared before the default area', () => {
    let score: (...points: string[]) => number;

    beforeEach(() => {
      score = scorerFor(html`${CITY_ZONES}${WHOLE_IMAGE}`);
    });

    it('scores 1 for a point inside a city zone', () => {
      expect(score(EDINBURGH), 'circle').toBe(1);
      expect(score(LONDON), 'rect').toBe(1);
      expect(score(MANCHESTER), 'poly').toBe(1);
    });

    it('scores 0.5 for a point outside every city zone, against the default area', () => {
      // Before #83 was fixed `ScoringHelper` folded `default` into its `circle` branch, read
      // `0,0,100%,100%` as a malformed circle and matched nothing — this click earned 0.
      expect(score(GLASGOW)).toBe(0.5);
    });

    it('does not also award the overlapping default area to a city point', () => {
      // Matching stops at the first entry containing the point; overlapping entries are not summed.
      // Without that, Edinburgh would score its circle *and* the whole-image catch-all.
      expect(score(EDINBURGH)).toBe(1);
    });

    it('scores 3 for all three cities, not 3.5', () => {
      expect(score(EDINBURGH, LONDON, MANCHESTER)).toBe(3);
    });

    it('adds up city points and default points', () => {
      expect(score(EDINBURGH, LONDON, GLASGOW)).toBe(2.5);
    });

    it('has no score at all when nothing is clicked', () => {
      // No candidate response is not the same as a wrong one: there is nothing to map, so the
      // expression is NULL rather than 0.
      expect(score()).toBe(null);
    });
  });

  // The same map authored the other way round. Not a bug to fix — it is what §7.4 prescribes, and
  // the reason the fallback belongs last.
  describe('with the default area declared before the city zones', () => {
    let score: (...points: string[]) => number;

    beforeEach(() => {
      score = scorerFor(html`${WHOLE_IMAGE}${CITY_ZONES}`);
    });

    it('awards the default area, not the city zone it overlaps', () => {
      expect(score(LONDON), 'rect').toBe(0.5);
      expect(score(EDINBURGH), 'circle').toBe(0.5);
      expect(score(MANCHESTER), 'poly').toBe(0.5);
    });

    it('still scores a point outside every city zone the same', () => {
      expect(score(GLASGOW)).toBe(0.5);
    });
  });
});
