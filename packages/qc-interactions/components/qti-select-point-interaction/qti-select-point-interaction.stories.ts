import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fireEvent, fn, waitFor, within } from 'storybook/test';

import type { QtiSelectPointInteraction } from '../..';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-select-point-interaction');

type Story = StoryObj<QtiSelectPointInteraction & typeof args>;

/**
 *
 * ### [3.2.17 Select Point Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.ev30y6ze263d)
 * a graphic interaction in which the candidate's task is to select one or more points.
 *
 */
const meta: Meta<QtiSelectPointInteraction> = {
  component: 'qti-select-point-interaction',
  title: '3.2 interaction types/17 Select Point',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs']
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
