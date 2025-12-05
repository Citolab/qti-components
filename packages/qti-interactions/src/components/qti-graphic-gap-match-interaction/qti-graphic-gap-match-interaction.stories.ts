import { expect, waitFor } from 'storybook/test';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { QtiGraphicGapMatchInteraction } from './qti-graphic-gap-match-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-graphic-gap-match-interaction');

type Story = StoryObj<QtiGraphicGapMatchInteraction & typeof args>;

/**
 *
 * ### [3.2.14 Graphic Gap Match Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.ous502odpreo)
 * Gaps are hotspots on an image; choices are external draggables.
 *
 */
const meta: Meta<QtiGraphicGapMatchInteraction> = {
  component: 'qti-graphic-gap-match-interaction',
  title: '14 Graphic Gap Match',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['drag-drop']
};
export default meta;

const withForm = (content: unknown) =>
  html`<form @submit=${(e: Event) => e.preventDefault()}>
    ${content}
    <button type="submit" data-testid="submit">Submit</button>
  </form>`;

const baseImage = html`<img
  alt="timeline from 1939 to 1991"
  src="assets/qti-graphic-gap-match-interaction/timeline-558.png"
  height="326"
  width="558"
/>`;

const baseChoices = html`
  <qti-gap-img identifier="DraggerA" match-max="2">
    <img
      src="assets/qti-graphic-gap-match-interaction/a-cw.png"
      alt="Choice A, The Cold War Ends"
      height="63"
      width="78"
    />
  </qti-gap-img>
  <qti-gap-img identifier="DraggerB" match-max="1">
    <img
      src="assets/qti-graphic-gap-match-interaction/b-ww2.png"
      alt="Choice B, World War 2 Ends"
      height="63"
      width="78"
    />
  </qti-gap-img>
  <qti-gap-img identifier="DraggerC" match-max="1">
    <img
      src="assets/qti-graphic-gap-match-interaction/c-vietnam.png"
      alt="Choice C, Vietnam Conflict Ends"
      height="63"
      width="78"
    />
  </qti-gap-img>
  <qti-gap-img identifier="DraggerD" match-max="1">
    <img src="assets/qti-graphic-gap-match-interaction/d-bay.png" alt="Choice D, Bay of Pigs" height="63" width="78" />
  </qti-gap-img>
`;

const baseHotspots = html`
  <qti-associable-hotspot coords="55,256,133,319" identifier="A" match-max="2" shape="rect"></qti-associable-hotspot>
  <qti-associable-hotspot coords="190,256,268,319" identifier="B" match-max="1" shape="rect"></qti-associable-hotspot>
  <qti-associable-hotspot coords="309,256,387,319" identifier="C" match-max="1" shape="rect"></qti-associable-hotspot>
  <qti-associable-hotspot coords="450,256,528,319" identifier="D" match-max="1" shape="rect"></qti-associable-hotspot>
`;

export const SingleUseHotspots: Story = {
  name: 'Single-use hotspots (default)',
  render: args =>
    html`${withForm(
      template(
        args,
        html`<qti-prompt>Fill each hotspot with one choice.</qti-prompt> ${baseImage} ${baseChoices} ${baseHotspots}`
      )
    )}`,
  play: async () => {
    // TODO: Drag each gap-img into distinct hotspots; assert only one per hotspot; re-drop replaces prior.
    // TODO: Click submit to trigger validation display when applicable.
  }
};

export const MinAssociations: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...args, 'min-associations': 2 },
        html`<qti-prompt>At least two hotspots must be filled.</qti-prompt> ${baseImage} ${baseChoices} ${baseHotspots}`
      )
    )}`,
  play: async () => {
    // TODO: With fewer than 2 filled hotspots, expect validation fail; with 2+, expect pass on validate/report.
    // TODO: Click submit to trigger validation display.
  }
};

export const MaxAssociations: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...args, 'max-associations': 2 },
        html`<qti-prompt>Only two hotspots may be filled.</qti-prompt> ${baseImage} ${baseChoices} ${baseHotspots}`
      )
    )}`,
  play: async () => {
    // TODO: Fill two hotspots, attempt a third; expect rejection/flag on validation (no global disabling).
    // TODO: Click submit to trigger validation display.
  }
};

export const MinAndMaxAssociations: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...args, 'min-associations': 1, 'max-associations': 1 },
        html`<qti-prompt>Exactly one hotspot must be filled.</qti-prompt> ${baseImage} ${baseChoices} ${baseHotspots}`
      )
    )}`,
  play: async () => {
    // TODO: Zero filled -> validation error; one filled -> pass; second placement should fail validation.
    // TODO: Click submit to trigger validation display.
  }
};

export const MixedMatchMax: Story = {
  render: args =>
    html`${withForm(
      template(
        args,
        html`<qti-prompt>Some choices can be reused; some hotspots allow multiple drops.</qti-prompt>
          <qti-gap-img identifier="DraggerA" match-max="1">
            <img src="assets/qti-graphic-gap-match-interaction/a-cw.png" alt="A single-use" height="63" width="78" />
          </qti-gap-img>
          <qti-gap-img identifier="DraggerB" match-max="0">
            <img src="assets/qti-graphic-gap-match-interaction/b-ww2.png" alt="B unlimited" height="63" width="78" />
          </qti-gap-img>
          <qti-gap-img identifier="DraggerC" match-max="2">
            <img src="assets/qti-graphic-gap-match-interaction/c-vietnam.png" alt="C twice" height="63" width="78" />
          </qti-gap-img>
          <qti-associable-hotspot
            coords="55,256,133,319"
            identifier="A"
            match-max="2"
            shape="rect"
          ></qti-associable-hotspot>
          <qti-associable-hotspot
            coords="190,256,268,319"
            identifier="B"
            match-max="1"
            shape="rect"
          ></qti-associable-hotspot>
          <qti-associable-hotspot
            coords="309,256,387,319"
            identifier="C"
            match-max="0"
            shape="rect"
          ></qti-associable-hotspot>
          <qti-associable-hotspot
            coords="450,256,528,319"
            identifier="D"
            match-max="1"
            shape="rect"
          ></qti-associable-hotspot> `
      )
    )}`,
  play: async () => {
    // TODO: Ensure unlimited choice (B) can be used multiple times; choice A only once; choice C twice; hotspot C unlimited; others respect match-max.
    // TODO: Click submit to trigger validation display.
  }
};

export const DisabledMode: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...args, disabled: true },
        html`<qti-prompt>Interaction is disabled.</qti-prompt> ${baseImage} ${baseChoices} ${baseHotspots}`
      )
    )}`,
  play: async () => {
    // TODO: Verify drags ignored and hotspots unchanged; validate/report should not change state.
    // TODO: Click submit to confirm no validation changes occur.
  }
};

export const ReadonlyMode: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...args, readonly: true },
        html`<qti-prompt>Interaction is readonly.</qti-prompt> ${baseImage} ${baseChoices} ${baseHotspots}`
      )
    )}`,
  play: async () => {
    // TODO: Pre-fill a hotspot (via args/initial response) and assert it renders but cannot be changed; drag attempts ignored.
    // TODO: Click submit to confirm no validation changes occur.
  }
};

export const PrefilledValue: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...args, response: ['DraggerA A', 'DraggerB B'] },
        html`<qti-prompt>Prefilled hotspots.</qti-prompt> ${baseImage} ${baseChoices} ${baseHotspots}`
      )
    )}`,
  play: async ({ canvasElement }) => {
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    submit?.click();
    // TODO: Assert prefilled placements render correctly and validation reflects filled hotspots.
  }
};

export const DragDropGraphicBehavior: Story = {
  name: 'Drag Drop Graphic Behavior',
  render: args =>
    withForm(
      template(
        { ...args, 'response-identifier': 'RESPONSE', name: 'RESPONSE' },
        html`
          <qti-prompt>Test drag and drop behavior for graphic gap match interaction.</qti-prompt>
          ${baseImage} ${baseChoices} ${baseHotspots}
        `
      )
    ),
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiGraphicGapMatchInteraction>(
      'qti-graphic-gap-match-interaction'
    )!;
    const draggerA = canvasElement.querySelector<HTMLElement>('[identifier="DraggerA"]')!;
    const draggerB = canvasElement.querySelector<HTMLElement>('[identifier="DraggerB"]')!;
    const draggerC = canvasElement.querySelector<HTMLElement>('[identifier="DraggerC"]')!;
    const draggerD = canvasElement.querySelector<HTMLElement>('[identifier="DraggerD"]')!;
    const hotspotA = canvasElement.querySelector<HTMLElement>('[identifier="A"]')!;
    const hotspotB = canvasElement.querySelector<HTMLElement>('[identifier="B"]')!;

    await interaction.updateComplete;

    await step('Verify all draggables initially visible', async () => {
      expect(window.getComputedStyle(draggerA).opacity).toBe('1');
      expect(window.getComputedStyle(draggerB).opacity).toBe('1');
      expect(window.getComputedStyle(draggerC).opacity).toBe('1');
      expect(window.getComputedStyle(draggerD).opacity).toBe('1');
    });

    await step('Test QTI spec directedPair response format for graphic', async () => {
      // QTI spec: Graphic gap match uses directedPair base-type
      // Response format: "dragger_id hotspot_id" for each placement

      interaction.response = ['DraggerA A', 'DraggerB B']; // Place draggers on hotspots

      await waitFor(() => {
        const response = interaction.response;
        expect(Array.isArray(response)).toBe(true);
        expect(response).toContain('DraggerA A');
        expect(response).toContain('DraggerB B');
      });
    });

    await step('Test match-max constraints for graphic hotspots', async () => {
      // QTI spec: Hotspot A has match-max=2 (can accept 2 draggers)
      // DraggerA has match-max=2 (can be used twice)

      interaction.response = ['DraggerA A', 'DraggerA C']; // DraggerA used twice

      await waitFor(() => {
        const response = interaction.response;
        expect(response).toContain('DraggerA A');
        expect(response).toContain('DraggerA C');
      });

      // Hotspot B has match-max=1 (single placement only)
      interaction.response = ['DraggerB B'];

      await waitFor(() => {
        const response = interaction.response;
        expect(response).toContain('DraggerB B');
      });
    });

    await step('Test draggable visibility during drag on graphic', async () => {
      // Test that during drag operation, only dragged item becomes invisible
      const pointerDownEvent = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
        button: 0,
        bubbles: true,
        isPrimary: true
      });

      draggerA.dispatchEvent(pointerDownEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      // Other draggers should remain visible
      expect(window.getComputedStyle(draggerB).opacity).toBe('1');
      expect(window.getComputedStyle(draggerC).opacity).toBe('1');
      expect(window.getComputedStyle(draggerD).opacity).toBe('1');

      // End drag
      const pointerUpEvent = new PointerEvent('pointerup', {
        pointerId: 1,
        clientX: 200,
        clientY: 200,
        button: 0,
        bubbles: true,
        isPrimary: true
      });
      document.dispatchEvent(pointerUpEvent);

      await new Promise(resolve => setTimeout(resolve, 50));
    });

    await step('Test image coordinate system', async () => {
      // QTI spec: Graphic interactions use image coordinate system
      expect(hotspotA.hasAttribute('coords')).toBe(true);
      expect(hotspotA.getAttribute('shape')).toBe('rect');
      expect(hotspotB.hasAttribute('coords')).toBe(true);
      expect(hotspotB.getAttribute('shape')).toBe('rect');
    });
  }
};

export const QTISpecGraphicCompliance: Story = {
  name: 'QTI 3.0 Graphic Gap Match Spec Compliance',
  render: args =>
    withForm(
      template(
        {
          ...args,
          'response-identifier': 'RESPONSE',
          name: 'RESPONSE',
          'data-max-choices-message': 'All hotspots filled',
          'data-min-choices-message': 'At least one placement required'
        },
        html`
          <qti-prompt>
            QTI 3.0 Graphic Gap Match: Place historical events on timeline. Demonstrates hotspot constraints and dragger
            reuse.
          </qti-prompt>
          ${baseImage}
          <qti-gap-img identifier="DraggerA" match-max="2">
            <img
              src="assets/qti-graphic-gap-match-interaction/a-cw.png"
              alt="Cold War (reusable)"
              height="63"
              width="78"
            />
          </qti-gap-img>
          <qti-gap-img identifier="DraggerB" match-max="1">
            <img
              src="assets/qti-graphic-gap-match-interaction/b-ww2.png"
              alt="WW2 (single use)"
              height="63"
              width="78"
            />
          </qti-gap-img>
          <qti-gap-img identifier="DraggerC" match-max="1">
            <img
              src="assets/qti-graphic-gap-match-interaction/c-vietnam.png"
              alt="Vietnam (single use)"
              height="63"
              width="78"
            />
          </qti-gap-img>
          <qti-associable-hotspot
            coords="55,256,133,319"
            identifier="A"
            match-max="2"
            shape="rect"
          ></qti-associable-hotspot>
          <qti-associable-hotspot
            coords="190,256,268,319"
            identifier="B"
            match-max="1"
            shape="rect"
          ></qti-associable-hotspot>
          <qti-associable-hotspot
            coords="309,256,387,319"
            identifier="C"
            match-max="1"
            shape="rect"
          ></qti-associable-hotspot>
        `
      )
    ),
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiGraphicGapMatchInteraction>(
      'qti-graphic-gap-match-interaction'
    )!;
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    await interaction.updateComplete;

    await step('Test QTI spec requirements for graphic gap match', async () => {
      // QTI spec: Graphic gap match combines hotspots on image with external draggers
      const image = interaction.querySelector('img');
      const hotspots = interaction.querySelectorAll('qti-associable-hotspot');
      const draggers = interaction.querySelectorAll('qti-gap-img');

      expect(image).toBeTruthy();
      expect(hotspots.length).toBeGreaterThan(0);
      expect(draggers.length).toBeGreaterThan(0);
    });

    await step('Test directedPair response validation for graphic', async () => {
      // Test that placements are properly formatted as directedPair
      interaction.response = ['DraggerA A', 'DraggerB B'];

      const response = interaction.response;
      expect(response.length).toBe(2);
      expect(response.every(pair => pair.includes(' '))).toBe(true); // All pairs have space separator
      expect(response.every(pair => pair.split(' ').length === 2)).toBe(true); // Format: dragger hotspot
    });

    await step('Test hotspot coordinate system', async () => {
      // QTI spec: Hotspots defined by coordinate regions on image
      const hotspotA = interaction.querySelector('[identifier="A"]') as HTMLElement;
      const hotspotB = interaction.querySelector('[identifier="B"]') as HTMLElement;

      expect(hotspotA.getAttribute('coords')).toBe('55,256,133,319'); // rect coordinates
      expect(hotspotA.getAttribute('shape')).toBe('rect');
      expect(hotspotB.getAttribute('coords')).toBe('190,256,268,319');
      expect(hotspotB.getAttribute('shape')).toBe('rect');
    });

    await step('Test dragger reuse constraints', async () => {
      // QTI spec: match-max controls how many times dragger can be used
      const draggerA = canvasElement.querySelector<HTMLElement>('[identifier="DraggerA"]')!;

      // DraggerA has match-max=2, should allow reuse
      interaction.response = ['DraggerA A', 'DraggerA C'];

      await waitFor(() => {
        const response = interaction.response as string[];
        expect(response.filter(r => r.startsWith('DraggerA')).length).toBe(2);
      });

      // After 2 uses, DraggerA should be disabled
      await waitFor(() => {
        expect(window.getComputedStyle(draggerA).pointerEvents).toBe('none');
      });
    });

    await step('Test hotspot capacity constraints', async () => {
      // QTI spec: match-max on hotspot controls how many draggers it accepts

      // Hotspot A has match-max=2, should accept 2 draggers
      interaction.response = ['DraggerA A', 'DraggerB A'];

      await waitFor(() => {
        const response = interaction.response as string[];
        expect(response.filter(r => r.endsWith(' A')).length).toBe(2);
      });

      // Hotspot B has match-max=1, should accept only 1 dragger
      interaction.response = ['DraggerC B'];

      await waitFor(() => {
        const response = interaction.response as string[];
        expect(response.filter(r => r.endsWith(' B')).length).toBe(1);
      });
    });

    await step('Test image-based interaction behavior', async () => {
      // QTI spec: Graphic interactions overlay interactive elements on image
      const img = interaction.querySelector('img')!;
      const imgRect = img.getBoundingClientRect();

      expect(imgRect.width).toBeGreaterThan(0);
      expect(imgRect.height).toBeGreaterThan(0);
      expect(img.getAttribute('alt')).toContain('timeline'); // Accessibility requirement
    });
  }
};
