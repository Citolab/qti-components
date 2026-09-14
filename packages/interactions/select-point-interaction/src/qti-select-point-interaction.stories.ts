import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fireEvent, fn, waitFor, within } from 'storybook/test';

import type { QtiSelectPointInteraction } from './qti-select-point-interaction';
import type { QtiAssessmentItem } from '@qti-components/elements';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-select-point-interaction', {
  excludeCategories: ['methods', 'events', 'properties']
});

type Story = StoryObj<QtiSelectPointInteraction & typeof args>;

/**
 *
 * ### [3.2.17 Select Point Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.ev30y6ze263d)
 * a graphic interaction in which the candidate's task is to select one or more points.
 *
 */
const meta: Meta<QtiSelectPointInteraction> = {
  component: 'qti-select-point-interaction',
  title: '17 Select Point',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs', 'iol']
};
export default meta;

export const Default: Story = {
  render: args =>
    template(
      args,
      html` <qti-prompt>Mark Edinburgh on this map of the United Kingdom.</qti-prompt>
        <img src="assets/qti-select-point-interaction/uk.png" height="280" width="206" />`
    ),
  args: {
    'response-identifier': 'RESPONSE',
    'max-choices': 1
  }
};

export const ClickImageTest: Story = {
  render: args =>
    template(
      args,
      html`
        <div style="width: 206px; height: 280px; display: block; border: 1px solid red;">
          <qti-select-point-interaction max-choices="1">
            <qti-prompt>Click anywhere on the interaction.</qti-prompt>
            <img
              src="assets/qti-select-point-interaction/uk.png"
              alt="map of united kingdom"
              height="280"
              width="206"
            />
          </qti-select-point-interaction>
        </div>
      `
    ),
  args: {
    'response-identifier': 'RESPONSE'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interactionElement = canvasElement.querySelector('qti-select-point-interaction')!;
    const image = interactionElement.querySelector('img')!;

    expect(image).not.toBeNull(); // Ensure image exists

    // Create a spy to listen for the response event
    const interactionResponseSpy = fn();
    interactionElement.addEventListener('qti-interaction-response', interactionResponseSpy);

    // Wait for the image to fully load
    await waitFor(() => {
      expect(image.complete).toBe(true);
      expect(image.naturalWidth).toBeGreaterThan(0);
      expect(image.naturalHeight).toBeGreaterThan(0);
    });

    // Define click position (center of image)
    const clickX = image.width / 2;
    const clickY = image.height / 2;

    // Fire click event at defined coordinates
    await fireEvent.click(image, {
      clientX: clickX,
      clientY: clickY
    });

    // Ensure event was triggered
    expect(interactionResponseSpy).toHaveBeenCalled();

    // Extract the event data
    const event = interactionResponseSpy.mock.calls[0][0];

    // Ensure the response contains the expected coordinate format
    expect(event.detail.responseIdentifier).toBe('RESPONSE');
    expect(event.detail.response).toHaveLength(1);

    // Extract and check coordinate format
    const [responseCoordinate] = event.detail.response;
    const [x, y] = responseCoordinate.split(' ').map(Number);

    // Check that the recorded coordinates are within reasonable bounds
    expect(x).toBeGreaterThan(0);
    expect(y).toBeGreaterThan(0);
    expect(x).toBeLessThanOrEqual(image.width);
    expect(y).toBeLessThanOrEqual(image.height);
  }
};

export const ScaledSmallerImageTest: Story = {
  render: args =>
    template(
      args,
      html`
        <div style="box-sizing: content-box;width: 103px; height: auto; display: block; border: 1px solid red;">
          <qti-select-point-interaction>
            <qti-prompt>Click anywhere on the scaled interaction.</qti-prompt>
            <img
              src="assets/qti-select-point-interaction/uk.png"
              alt="map of united kingdom"
              height="280"
              width="206"
            />
          </qti-select-point-interaction>
        </div>
      `
    ),
  args: {
    'response-identifier': 'RESPONSE'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interactionElement = canvasElement.querySelector('qti-select-point-interaction')!;
    const image = interactionElement.querySelector('img')!;

    expect(image).not.toBeNull(); // Ensure image exists

    // Wait for the image to fully load
    await waitFor(() => {
      expect(image.complete).toBe(true);
      expect(image.naturalWidth).toBeGreaterThan(0);
      expect(image.naturalHeight).toBeGreaterThan(0);
    });

    // Get the actual rendered size
    const rect = image.getBoundingClientRect();
    const scaleX = 206 / rect.width; // Original width / Scaled width
    const scaleY = 280 / rect.height; // Original height / Scaled height

    expect(rect.width).toBeCloseTo(103, 0); // Ensure image width is scaled to 103px
    expect(rect.height).toBeCloseTo((280 / 206) * 103, 0); // Ensure aspect ratio is maintained

    // Create a spy to listen for the response event
    const interactionResponseSpy = fn();
    interactionElement.addEventListener('qti-interaction-response', interactionResponseSpy);

    // Define click position (center of scaled image)
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    // Fire click event at center of scaled image
    await fireEvent.click(image, {
      clientX: clickX,
      clientY: clickY
    });

    // Ensure event was triggered
    expect(interactionResponseSpy).toHaveBeenCalled();

    // Extract the event data
    const event = interactionResponseSpy.mock.calls[0][0];

    // Expected coordinates (center of original image)
    const expectedX = 206 / 2;
    const expectedY = 280 / 2;

    // Ensure the response contains the expected coordinate format
    expect(event.detail.responseIdentifier).toBe('RESPONSE');
    expect(event.detail.response).toHaveLength(1);

    // Extract and check coordinate format
    const [responseCoordinate] = event.detail.response;
    const [x, y] = responseCoordinate.split(' ').map(Number);

    // Check that the coordinates match the expected scaled values
    expect(Math.abs(x - expectedX)).toBeLessThanOrEqual(2);
    expect(Math.abs(y - expectedY)).toBeLessThanOrEqual(2);
  }
};

/**
 * Helper function to click on the center of the image.
 */
const clickImage = async (image: HTMLImageElement, xOffset: number, yOffset: number) => {
  const rect = image.getBoundingClientRect();
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: rect.left + rect.width * xOffset,
    clientY: rect.top + rect.height * yOffset
  });
  image.dispatchEvent(event);
  // await fireEvent.click(image, {
  //   clientX: rect.left + rect.width * xOffset,
  //   clientY: rect.top + rect.height * yOffset
  // });
};

/**
 * 1. If max-choices = 1 then clicking twice on the same location should result in a RESPONSE with one point.
 */
export const MaxChoice_One_SameLocation: Story = {
  render: args =>
    template(
      { ...args, 'max-choices': 1 },
      html`
        <qti-select-point-interaction max-choices="1">
          <qti-prompt>Click twice on the same location.</qti-prompt>
          <img src="assets/qti-select-point-interaction/uk.png" alt="map of united kingdom" height="280" width="206" />
        </qti-select-point-interaction>
      `
    ),
  args: {
    'response-identifier': 'RESPONSE'
  },
  play: async ({ canvasElement }) => {
    const interactionElement = canvasElement.querySelector('qti-select-point-interaction')!;
    const image = interactionElement.querySelector('img')!;

    expect(image).not.toBeNull();
    await waitFor(() => expect(image.complete).toBe(true));

    const responseSpy = fn();
    interactionElement.addEventListener('qti-interaction-response', responseSpy);

    // Click twice at the same location (center)
    await clickImage(image, 0.5, 0.5);
    await clickImage(image, 0.5, 0.5);

    const event = responseSpy.mock.calls[1][0];
    expect(event.detail.response).toHaveLength(1);
  }
};

/**
 * 2. If max-choices = 2 then clicking twice on the same location should result in a RESPONSE with zero points.
 */
export const MaxChoice_Two_SameLocation: Story = {
  render: args =>
    template(
      { ...args, 'max-choices': 2 },
      html`
        <qti-select-point-interaction max-choices="2">
          <qti-prompt>Click twice on the same location.</qti-prompt>
          <img src="assets/qti-select-point-interaction/uk.png" alt="map of united kingdom" height="280" width="206" />
        </qti-select-point-interaction>
      `
    ),
  args: {
    'response-identifier': 'RESPONSE'
  },
  play: async ({ canvasElement }) => {
    const interactionElement = canvasElement.querySelector('qti-select-point-interaction')!;
    const shadowRoot = interactionElement.shadowRoot!;
    const image = interactionElement.querySelector('img')!;

    expect(image).not.toBeNull();
    await waitFor(() => expect(image.complete).toBe(true));

    const responseSpy = fn();
    interactionElement.addEventListener('qti-interaction-response', responseSpy);

    // Click twice at the same location
    await clickImage(image, 0.5, 0.5);

    const button = await waitFor(() => shadowRoot.querySelector('button'));
    await fireEvent.click(button); // somehow clicking the same location again with mouse doesn't work in storybook

    const event = responseSpy.mock.calls[2][0];
    expect(event.detail.response).toHaveLength(0); // Should be empty
  }
};

/**
 * 3. If max-choices = 1 then clicking twice on another location should result in a RESPONSE with one point.
 */
export const MaxChoice_One_DifferentLocation: Story = {
  render: args =>
    template(
      { ...args, 'max-choices': 1 },
      html` <qti-select-point-interaction max-choices="1">
        <qti-prompt>Click two different locations.</qti-prompt>
        <img src="assets/qti-select-point-interaction/uk.png" alt="map of united kingdom" height="280" width="206" />
      </qti-select-point-interaction>`
    ),
  args: {
    'response-identifier': 'RESPONSE'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interactionElement = canvasElement.querySelector('qti-select-point-interaction')!;
    const image = interactionElement.querySelector('img')!;

    expect(image).not.toBeNull();
    await waitFor(() => expect(image.complete).toBe(true));

    const responseSpy = fn();
    interactionElement.addEventListener('qti-interaction-response', responseSpy);

    // Click at two different locations
    await clickImage(image, 0.3, 0.3);
    await clickImage(image, 0.7, 0.7);

    const event = responseSpy.mock.calls[1][0];
    expect(event.detail.response).toHaveLength(1);
  }
};

/**
 * 4. If max-choices = 2 then clicking twice on another location should result in a RESPONSE with two points.
 */
export const MaxChoice_Two_DifferentLocations: Story = {
  render: args =>
    template(
      { ...args, 'max-choices': 2 },
      html`
        <qti-select-point-interaction max-choices="2">
          <qti-prompt>Click two different locations.</qti-prompt>
          <img src="assets/qti-select-point-interaction/uk.png" alt="map of united kingdom" height="280" width="206" />
        </qti-select-point-interaction>
      `
    ),
  args: {
    'response-identifier': 'RESPONSE'
  },
  play: async ({ canvasElement }) => {
    const interactionElement = canvasElement.querySelector('qti-select-point-interaction')!;
    const image = interactionElement.querySelector('img')!;

    expect(image).not.toBeNull();
    await waitFor(() => expect(image.complete).toBe(true));

    const responseSpy = fn();
    interactionElement.addEventListener('qti-interaction-response', responseSpy);

    // Click at two different locations
    await clickImage(image, 0.3, 0.3);
    await clickImage(image, 0.7, 0.7);
    const event = responseSpy.mock.calls[2][0];
    expect(event.detail.response).toHaveLength(2);
  }
};

/**
 * 5. If max-choices = 2 then clicking 3 times on different locations should result in a RESPONSE with two points.
 */
export const MaxChoice_Two_ThreeClicks: Story = {
  render: args =>
    template(
      { ...args, 'max-choices': 2 },
      html`
        <qti-select-point-interaction max-choices="2">
          <qti-prompt>Click three different locations.</qti-prompt>
          <img src="assets/qti-select-point-interaction/uk.png" alt="map of united kingdom" height="280" width="206" />
        </qti-select-point-interaction>
      `
    ),
  args: {
    'response-identifier': 'RESPONSE'
  },
  play: async ({ canvasElement }) => {
    const interactionElement = canvasElement.querySelector('qti-select-point-interaction')!;
    const image = interactionElement.querySelector('img')!;

    expect(image).not.toBeNull();
    await waitFor(() => expect(image.complete).toBe(true));

    const responseSpy = fn();
    interactionElement.addEventListener('qti-interaction-response', responseSpy);

    await clickImage(image, 0.2, 0.2);
    await clickImage(image, 0.5, 0.5);
    await clickImage(image, 0.8, 0.8);

    const event = responseSpy.mock.calls[3][0];
    expect(event.detail.response).toHaveLength(2);
  }
};

/**
 * The four `qti-area-map-entry` shapes from
 * [Citolab/qti-components#83](https://github.com/Citolab/qti-components/issues/83), copied out of
 * the item that issue links. One entry of every shape the spec allows, over the same UK map:
 * `circle` for Edinburgh, `rect` for London, `poly` for Manchester, and `default` for everything
 * else — the whole image, worth half a point.
 */
const issue83AreaEntries = [
  { label: 'Edinburgh', shape: 'circle', coords: '96,114,16', mappedValue: 1 },
  { label: 'London', shape: 'rect', coords: '125,220,145,240', mappedValue: 1 },
  { label: 'Manchester', shape: 'poly', coords: '85,160,95,155,100,165,95,175,85,170,80,165,85,160', mappedValue: 1 },
  { label: 'everything else', shape: 'default', coords: '0,0,100%,100%', mappedValue: 0.5 }
];

/** `positionOverlayElements` is the interaction's own protected hook — the same one
 * `QtiSelectPointInteractionCorrection` calls to lay out the answer-key overlay. Reached through a
 * structural type so this story exercises the real code path without dragging
 * `@qti-components/corrections` into this package (it already depends on this one). */
type WithOverlayPositioning = QtiSelectPointInteraction & {
  positionOverlayElements(elements: Iterable<HTMLElement>): void;
};

/**
 * Regression guard for [Citolab/qti-components#83](https://github.com/Citolab/qti-components/issues/83):
 * *Unsupported shape: default*.
 *
 * Showing the correct response on a select-point item turns every `qti-area-map-entry` into an
 * overlay box and hands it to `positionOverlayElements`, which forwards each one to `positionShapes`.
 * That function knew `circle`, `rect`, `ellipse` and `poly`, so `shape="default"` fell into its own
 * `default:` branch, logged `Unsupported shape: default`, and returned without touching the element
 * — the fourth area sat in the DOM with no geometry and was never visible.
 *
 * Scoring was broken in its own way: `ScoringHelper.isPointInArea` had a `case 'default'`, but folded
 * in with `case 'circle'`, so it read the coords as `[cx, cy, radius]` and rejected the issue's
 * four-value `0,0,100%,100%` as an `Invalid circle definition`. A click outside the three city zones
 * never earned its 0.5.
 *
 * Both are fixed by *not reading the coords at all*. QTI 3.0 §7.9 says "default: no coordinates
 * should be given", the XSD nonetheless makes `coords` `use="required"`, and HTML — where the
 * vocabulary comes from — settles it: "This area is the whole image. (The coords attribute is not
 * used.)" So the `100%` values never need resolving; they are filler for a required attribute.
 *
 * A third fix rides along in `qti-map-response-point`. A whole-image area overlaps every other area,
 * which made the missing first-match-wins `break` reachable for the first time: without it, a point
 * inside Edinburgh's circle would score the circle *and* the catch-all, totalling 3.5 out of 3 on
 * this very item. §7.4: "each area is tested in turn, with those listed first taking priority".
 */
export const AreaMappingShapes_Issue83: Story = {
  name: 'area mapping shapes (#83 — default shape renders and scores)',
  // No `template()` helper here: it wraps the markup in a *second* `qti-select-point-interaction`,
  // and since the interaction binds its click handler to `this.querySelector('img')` both copies
  // would claim the same image and every click would be counted twice. This story needs a real item
  // around the interaction anyway — `qti-map-response-point` is what turns the area map into a
  // score, and it only exists inside response processing.
  render: () => html`
    <qti-assessment-item identifier="uk-map" title="Cities of the United Kingdom">
      <qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="point">
        <qti-area-mapping default-value="0">
          ${issue83AreaEntries.map(
            entry => html`
              <qti-area-map-entry
                shape=${entry.shape}
                coords=${entry.coords}
                mapped-value=${entry.mappedValue}
              ></qti-area-map-entry>
            `
          )}
        </qti-area-mapping>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
        <qti-default-value><qti-value>0</qti-value></qti-default-value>
      </qti-outcome-declaration>

      <qti-item-body>
        <qti-select-point-interaction response-identifier="RESPONSE" max-choices="3">
          <qti-prompt>
            Mark any of these cities on this map of the United Kingdom: Edinburgh, London or Manchester.
          </qti-prompt>
          <img src="assets/qti-select-point-interaction/uk.png" alt="map of united kingdom" height="280" width="206" />
          ${issue83AreaEntries.map(
            entry => html`
              <div
                data-area-overlay
                data-shape=${entry.shape}
                data-coord=${entry.coords}
                title=${`${entry.label} (${entry.shape})`}
                style="position:absolute;pointer-events:none;background-color:rgb(0 128 0 / 40%);outline:1px solid green;"
              ></div>
            `
          )}
        </qti-select-point-interaction>
      </qti-item-body>

      <qti-response-processing>
        <qti-set-outcome-value identifier="SCORE">
          <qti-map-response-point identifier="RESPONSE"></qti-map-response-point>
        </qti-set-outcome-value>
      </qti-response-processing>
    </qti-assessment-item>
  `,
  play: async ({ canvasElement, step }) => {
    const interactionElement = canvasElement.querySelector('qti-select-point-interaction') as WithOverlayPositioning;
    const image = interactionElement.querySelector('img')!;

    await waitFor(() => {
      expect(image.complete).toBe(true);
      expect(image.naturalWidth).toBeGreaterThan(0);
    });

    const overlays = Array.from(interactionElement.querySelectorAll<HTMLElement>('[data-area-overlay]'));
    expect(overlays).toHaveLength(4);
    const overlayFor = (shape: string) => overlays.find(overlay => overlay.dataset.shape === shape)!;

    // The issue's third reproduction step is "check the console for errors", so make the console part
    // of the test rather than something a human has to notice.
    const consoleErrors: string[] = [];
    const originalError = console.error;
    console.error = (...messageParts: unknown[]) => {
      consoleErrors.push(messageParts.join(' '));
      originalError(...messageParts);
    };

    try {
      await step('lay the area entries out the way the answer key does', async () => {
        interactionElement.positionOverlayElements(overlays);
      });

      await step('the three supported shapes are placed on the map', async () => {
        for (const shape of ['circle', 'rect', 'poly']) {
          const overlay = overlayFor(shape);
          expect(overlay.style.width, `${shape} should be sized`).not.toBe('');
          expect(overlay.getBoundingClientRect().width, `${shape} should be visible`).toBeGreaterThan(0);
        }
      });

      await step('the default area covers the whole image', async () => {
        // A `default` area is, by the QTI/HTML image-map definition, the entire image — so it lands
        // at the origin at full size whatever its coords say. Before #83 was fixed `positionShapes`
        // had no `default` branch and wrote no styles at all, leaving every one of these empty.
        const overlay = overlayFor('default');
        expect(overlay.style.left, 'default should start at the left edge').toBe('0%');
        expect(overlay.style.top, 'default should start at the top edge').toBe('0%');
        expect(overlay.style.width, 'default should span the full width').toBe('100%');
        expect(overlay.style.height, 'default should span the full height').toBe('100%');
      });

      await step('the default area is actually visible', async () => {
        const overlay = overlayFor('default');
        const box = overlay.getBoundingClientRect();
        const imageBox = image.getBoundingClientRect();
        expect(box.width, 'default should be as wide as the map').toBeCloseTo(imageBox.width, 0);
        expect(box.height, 'default should be as tall as the map').toBeCloseTo(imageBox.height, 0);
      });

      await step('no "Unsupported shape" error is logged', async () => {
        expect(consoleErrors.filter(message => message.includes('Unsupported shape'))).toEqual([]);
      });
    } finally {
      console.error = originalError;
    }

    // The rest of the issue: the areas have to *score*. This runs the real pipeline — click the
    // image, let the interaction save the point, run response processing, read SCORE — rather than
    // calling `ScoringHelper` directly, so the wiring from a click to `qti-map-response-point` is
    // covered too. Unit coverage of the mapping itself lives in `qti-map-response-point.spec.ts`.
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    /*
     * Clicks a point given in the coordinate system the area map uses. That system is the img's
     * declared `width`/`height` — 206x280 here — not its natural size: the interaction scales a
     * click by those attributes (see its #calculateScale), and this map's source file is much
     * bigger than the box it is displayed in.
     */
    const mapWidth = Number(image.getAttribute('width')) || image.naturalWidth;
    const mapHeight = Number(image.getAttribute('height')) || image.naturalHeight;
    const clickPoint = async (x: number, y: number) => {
      const rect = image.getBoundingClientRect();
      image.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + (x / mapWidth) * rect.width,
          clientY: rect.top + (y / mapHeight) * rect.height
        })
      );
      assessmentItem.processResponse();
      await assessmentItem.updateComplete;
    };
    const score = () => Number(assessmentItem.getOutcome('SCORE').value);

    await step('a click inside a city zone scores its full point', async () => {
      // Edinburgh, the centre of the circle. 1 and not 1.5: the whole-image `default` area contains
      // this point too, and only first-match-wins (§7.4) keeps the two from being summed.
      await clickPoint(96, 114);
      expect(score()).toBe(1);
    });

    await step('a click outside every city zone scores 0.5 against the default area', async () => {
      // Glasgow — not one of the cities the prompt names, and inside no city zone, so only the
      // `default` entry can match it. Before #83 was fixed, `ScoringHelper` folded `default` into
      // its `circle` branch, read `0,0,100%,100%` as a malformed circle and matched nothing, so
      // this click earned 0 and the total stayed at 1.
      await clickPoint(60, 120);
      expect(score()).toBe(1.5);
    });

    await step('a second city zone adds its own full point', async () => {
      // London, inside the rect. The `default` area has already been used by the Glasgow click, so
      // there is nothing left for it to add here either way.
      await clickPoint(135, 230);
      expect(score()).toBe(2.5);
    });
  }
};
