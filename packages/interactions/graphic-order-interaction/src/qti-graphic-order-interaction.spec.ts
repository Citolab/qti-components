/**
 * Regression for issue #209, on the QTI 3 "Flying Home" example item verbatim.
 *
 * Two defects met there. The response was published by ChoicesMixin as the set of *checked*
 * choices in DOM order, so the candidate's ordering — the whole point of this interaction —
 * never reached RESPONSE; a max-choices default of 1 also cleared the previous hotspot on every
 * click. And the graphic was looked up as `img` only, while the spec's example carries it as
 * `<object type="image/png">`, so positionShapes ran on null and every hotspot stayed unpositioned
 * at the theme's 100%x100%, stacked after the image.
 */
import '@citolab/qti-components';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiGraphicOrderInteraction } from './qti-graphic-order-interaction';

// 1x1 transparent PNG. The coordinate space comes from the width/height attributes, as QTI
// requires on the graphic, so the bitmap's own size is irrelevant here.
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const flyingHome = (graphic: string) => `
<qti-assessment-item identifier="graphicOrder" title="Flying Home" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="ordered" base-type="identifier">
    <qti-correct-response>
      <qti-value>A</qti-value><qti-value>D</qti-value><qti-value>C</qti-value><qti-value>B</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value><qti-value>0</qti-value></qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <qti-graphic-order-interaction response-identifier="RESPONSE">
      <qti-prompt>Mark the airports shown on the map according to Lorna's preferences.</qti-prompt>
      ${graphic}
      <qti-hotspot-choice shape="circle" coords="77,115,8" identifier="A"></qti-hotspot-choice>
      <qti-hotspot-choice shape="circle" coords="118,184,8" identifier="B"></qti-hotspot-choice>
      <qti-hotspot-choice shape="circle" coords="150,235,8" identifier="C"></qti-hotspot-choice>
      <qti-hotspot-choice shape="circle" coords="96,114,8" identifier="D"></qti-hotspot-choice>
    </qti-graphic-order-interaction>
  </qti-item-body>
  <qti-response-processing>
    <qti-response-condition>
      <qti-response-if>
        <qti-match>
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-match>
        <qti-set-outcome-value identifier="SCORE">
          <qti-base-value base-type="float">1</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-if>
      <qti-response-else>
        <qti-set-outcome-value identifier="SCORE">
          <qti-base-value base-type="float">0</qti-base-value>
        </qti-set-outcome-value>
      </qti-response-else>
    </qti-response-condition>
  </qti-response-processing>
</qti-assessment-item>`;

// The same map as a real 206x280 bitmap. Where the item declares no usable width/height the
// coordinate space can only come from the bitmap itself, so those cases need one that is not 1x1.
const PNG_206x280 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM4AAAEYCAAAAAAxZJaeAAAA+klEQVR42u3PgQwAAAACsPzZgsqj/QZPr0RHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0fntzM4mJY+RyIT4gAAAABJRU5ErkJggg==';

const asObject = `<object type="image/png" width="206" height="280" data="${PNG}">UK Map</object>`;
const asImg = `<img width="206" height="280" src="${PNG}" alt="UK Map"/>`;

describe('qti-graphic-order-interaction', () => {
  let host: HTMLElement;
  let item: QtiAssessmentItem;
  let interaction: QtiGraphicOrderInteraction;

  const mount = async (graphic: string) => {
    host = document.createElement('div');
    host.style.cssText = 'position:relative;width:360px;padding:20px;background:#fff';
    document.body.appendChild(host);
    host.innerHTML = flyingHome(graphic);

    item = host.querySelector('qti-assessment-item') as QtiAssessmentItem;
    interaction = host.querySelector('qti-graphic-order-interaction') as QtiGraphicOrderInteraction;
    await item.updateComplete;
    await interaction.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  afterEach(() => host?.remove());

  const hotspot = (identifier: string) =>
    host.querySelector(`qti-hotspot-choice[identifier="${identifier}"]`) as HTMLElement;

  const click = async (...identifiers: string[]) => {
    for (const identifier of identifiers) {
      hotspot(identifier).click();
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const pins = () => Array.from(host.querySelectorAll('.cito-graphic-order-marker')).map(pin => pin.textContent);

  const score = () =>
    item['_context'].variables.find((variable: { identifier: string }) => variable.identifier === 'SCORE');

  describe.each([
    ['<object>', asObject],
    ['<img>', asImg]
  ])('with the graphic as %s', (_label, graphic) => {
    beforeEach(() => mount(graphic));

    // Defect 2: an unpositioned hotspot keeps the theme's 100%x100% and stacks after the graphic.
    it('positions every hotspot against the graphic', () => {
      for (const identifier of ['A', 'B', 'C', 'D']) {
        const style = hotspot(identifier).style;
        expect(parseFloat(style.left), `hotspot ${identifier} has no left`).toBeGreaterThan(0);
        expect(parseFloat(style.top), `hotspot ${identifier} has no top`).toBeGreaterThan(0);
        // coords put each circle at r=8 in a 206x280 space — a dot, not the whole graphic.
        expect(parseFloat(style.width), `hotspot ${identifier} spans the graphic`).toBeLessThan(20);
      }
      // The left-to-right order of the coords, so the mapping is not just "some number".
      const left = (identifier: string) => parseFloat(hotspot(identifier).style.left);
      expect(left('A')).toBeLessThan(left('D'));
      expect(left('D')).toBeLessThan(left('B'));
      expect(left('B')).toBeLessThan(left('C'));
    });

    // Defect 1: RESPONSE used to be a single identifier, the last hotspot clicked.
    it('publishes the candidate ordering as the response', async () => {
      await click('A', 'D', 'C', 'B');
      expect(interaction.response).toEqual(['A', 'D', 'C', 'B']);
      expect(pins()).toEqual(['1', '2', '3', '4']);
    });

    it('scores the ordered response through response processing', async () => {
      await click('A', 'D', 'C', 'B');
      item.processResponse();
      expect(score()!.value).toBe('1');
    });

    it('scores a wrong ordering as incorrect', async () => {
      await click('A', 'B', 'C', 'D');
      expect(interaction.response).toEqual(['A', 'B', 'C', 'D']);
      item.processResponse();
      expect(score()!.value).toBe('0');
    });

    it('renumbers the rest when a hotspot is unset', async () => {
      await click('A', 'D', 'C', 'B');
      await click('D');
      expect(interaction.response).toEqual(['A', 'C', 'B']);
      expect(pins()).toEqual(['1', '2', '3']);
    });

    it('clears the response when every hotspot is unset', async () => {
      await click('A', 'D');
      await click('A', 'D');
      expect(interaction.response).toEqual([]);
      expect(pins()).toEqual([]);
    });

    // Orders follow the response, so a restored attempt repaints the pins.
    it('repaints the pins from a response set programmatically', async () => {
      interaction.response = ['C', 'A'];
      await interaction.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(pins()).toEqual(['1', '2']);
      expect(hotspot('C').getAttribute('aria-ordervalue')).toBe('1');
      expect(hotspot('A').getAttribute('aria-ordervalue')).toBe('2');
      expect(hotspot('B').hasAttribute('aria-ordervalue')).toBe(false);
    });

    // Ordering is not a single-select; the old ChoicesMixin default made it a radiogroup.
    it('does not cap the ordering at one hotspot', () => {
      expect(interaction.maxChoices).toBe(0);
    });

    it('honours an explicit max-choices', async () => {
      interaction.maxChoices = 2;
      await click('A', 'D', 'C');
      expect(interaction.response).toEqual(['A', 'D']);
    });
  });
  /*
   * width/height are *optional* on the QTI <object> — the schema requires only `data` and `type` —
   * and LengthDType is `[0-9]+%?`, so a percentage is valid on either form. In neither case can the
   * coordinate space come from the attributes, and both left every hotspot unpositioned: the first
   * bailed out with no size at all, the second read "50%" as 50px.
   */
  describe.each([
    ['an <object> that declares no size', `<object type="image/png" data="${PNG_206x280}">UK Map</object>`],
    [
      'an <object> sized in percent',
      `<object type="image/png" width="50%" height="50%" data="${PNG_206x280}">UK Map</object>`
    ],
    ['an <img> sized in percent', `<img width="50%" height="50%" src="${PNG_206x280}" alt="UK Map"/>`]
  ])('with %s', (_label, graphic) => {
    beforeEach(() => mount(graphic));

    it("positions the hotspots against the bitmap's own 206x280 space", () => {
      // A: coords 77,115,8 -> left (77-8)/206, top (115-8)/280, width 16/206, height 16/280.
      const style = hotspot('A').style;
      expect(parseFloat(style.left)).toBeCloseTo(33.5, 1);
      expect(parseFloat(style.top)).toBeCloseTo(38.2, 1);
      expect(parseFloat(style.width)).toBeCloseTo(7.77, 1);
      expect(parseFloat(style.height)).toBeCloseTo(5.71, 1);
    });

    it('positions every hotspot, in the left-to-right order of the coords', () => {
      for (const identifier of ['A', 'B', 'C', 'D']) {
        const style = hotspot(identifier).style;
        expect(parseFloat(style.left), `hotspot ${identifier} has no left`).toBeGreaterThan(0);
        expect(parseFloat(style.top), `hotspot ${identifier} has no top`).toBeGreaterThan(0);
        // Reading "50%" as 50px would make this 32% and push C's left past 100%.
        expect(parseFloat(style.width), `hotspot ${identifier} spans the graphic`).toBeLessThan(20);
        expect(parseFloat(style.left), `hotspot ${identifier} is off the graphic`).toBeLessThan(100);
      }
      const left = (identifier: string) => parseFloat(hotspot(identifier).style.left);
      expect(left('A')).toBeLessThan(left('D'));
      expect(left('D')).toBeLessThan(left('B'));
      expect(left('B')).toBeLessThan(left('C'));
    });
  });
});
