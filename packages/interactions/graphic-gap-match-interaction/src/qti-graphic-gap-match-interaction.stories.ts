import { html } from 'lit';
import { expect, fn } from 'storybook/test';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import drag from '../../../../tools/testing/drag';

import type { QtiGraphicGapMatchInteraction } from './qti-graphic-gap-match-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-graphic-gap-match-interaction');

type Story = StoryObj<QtiGraphicGapMatchInteraction & typeof args>;

/**
 *
 * ### [3.2.14 Graphic Gap Match Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.7cs7637r54vv)
 * a graphical interaction with a set of gaps that are defined as areas (hotspots) of the graphic image and an additional set of gap choices that are defined outside the image. The candidate must associate the gap choices with the gaps in the image and be able to review the image with the gaps filled in context, as indicated by their choices.
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
  }
};
export default meta;

export const Default: Story = {
  render: args => html`
    ${template(
      args,
      html`
        <qti-prompt>
          <p>
            Some labels on this Cold War timeline are missing. Drag each event tile to the correct highlighted hotspot.
          </p>
        </qti-prompt>

        <img
          alt="timeline from 1939 to 1991"
          src="assets/qti-graphic-gap-match-interaction/timeline-558.png"
          height="326"
          width="558"
        />
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
          <img
            src="assets/qti-graphic-gap-match-interaction/d-bay.png"
            alt="Choice D, Bay of Pigs"
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
        <qti-associable-hotspot
          coords="450,256,528,319"
          identifier="D"
          match-max="1"
          shape="rect"
        ></qti-associable-hotspot>
      `
    )}
  `
};

const settleInteraction = async (interaction: QtiGraphicGapMatchInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getHotspot = (interaction: QtiGraphicGapMatchInteraction, identifier: string) =>
  interaction.querySelector(`qti-associable-hotspot[identifier="${identifier}"]`) as HTMLElement;

export const SortableSwapFilledHotspots: Story = {
  name: 'Behavior: sortable swap across occupied hotspots',
  render: () => html`
    <qti-graphic-gap-match-interaction
      data-testid="graphic-gap-match-interaction"
      response-identifier="RESPONSE"
      max-associations="4"
    >
      <img
        alt="timeline from 1939 to 1991"
        src="assets/qti-graphic-gap-match-interaction/timeline-558.png"
        height="326"
        width="558"
      />
      <qti-gap-img identifier="DraggerA" match-max="1">
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
        <img
          src="assets/qti-graphic-gap-match-interaction/d-bay.png"
          alt="Choice D, Bay of Pigs"
          height="63"
          width="78"
        />
      </qti-gap-img>
      <qti-associable-hotspot coords="55,256,133,319" identifier="A" match-max="1" shape="rect"></qti-associable-hotspot>
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
      <qti-associable-hotspot
        coords="450,256,528,319"
        identifier="D"
        match-max="1"
        shape="rect"
      ></qti-associable-hotspot>
    </qti-graphic-gap-match-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector('[data-testid="graphic-gap-match-interaction"]') as QtiGraphicGapMatchInteraction;
    await settleInteraction(interaction);

    const draggerA = interaction.querySelector('qti-gap-img[identifier="DraggerA"]') as HTMLElement;
    const draggerB = interaction.querySelector('qti-gap-img[identifier="DraggerB"]') as HTMLElement;
    const draggerC = interaction.querySelector('qti-gap-img[identifier="DraggerC"]') as HTMLElement;
    const draggerD = interaction.querySelector('qti-gap-img[identifier="DraggerD"]') as HTMLElement;
    const hotspotA = getHotspot(interaction, 'A');
    const hotspotB = getHotspot(interaction, 'B');
    const hotspotC = getHotspot(interaction, 'C');
    const hotspotD = getHotspot(interaction, 'D');

    const callback = fn((event: CustomEvent<{ response: string[] }>) => event.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Place all four choices into hotspots', async () => {
        await drag(draggerA, { to: hotspotA, duration: 300 });
        await settleInteraction(interaction);
        await drag(draggerB, { to: hotspotB, duration: 300 });
        await settleInteraction(interaction);
        await drag(draggerC, { to: hotspotC, duration: 300 });
        await settleInteraction(interaction);
        await drag(draggerD, { to: hotspotD, duration: 300 });
        await settleInteraction(interaction);

        expect(hotspotA.querySelector('[identifier="DraggerA"]')).toBeTruthy();
        expect(hotspotB.querySelector('[identifier="DraggerB"]')).toBeTruthy();
        expect(hotspotC.querySelector('[identifier="DraggerC"]')).toBeTruthy();
        expect(hotspotD.querySelector('[identifier="DraggerD"]')).toBeTruthy();
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual([
          'DraggerA A',
          'DraggerB B',
          'DraggerC C',
          'DraggerD D'
        ]);
      });

      await step('Drag placed DraggerA from A onto occupied B to trigger sortable swap', async () => {
        const placedDraggerA = getHotspot(interaction, 'A').querySelector('[identifier="DraggerA"]') as HTMLElement;
        await drag(placedDraggerA, { to: hotspotB, duration: 300 });
        await settleInteraction(interaction);

        expect(hotspotA.querySelector('[identifier="DraggerB"]')).toBeTruthy();
        expect(hotspotB.querySelector('[identifier="DraggerA"]')).toBeTruthy();
        expect(hotspotC.querySelector('[identifier="DraggerC"]')).toBeTruthy();
        expect(hotspotD.querySelector('[identifier="DraggerD"]')).toBeTruthy();
      });

      await step('Response reflects swapped hotspot assignments', async () => {
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual([
          'DraggerB A',
          'DraggerA B',
          'DraggerC C',
          'DraggerD D'
        ]);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const SortableSwapPartialHotspots: Story = {
  name: 'Behavior: sortable swap with one choice still in inventory',
  render: () => html`
    <qti-graphic-gap-match-interaction
      data-testid="graphic-gap-match-interaction"
      response-identifier="RESPONSE"
      max-associations="4"
    >
      <img
        alt="timeline from 1939 to 1991"
        src="assets/qti-graphic-gap-match-interaction/timeline-558.png"
        height="326"
        width="558"
      />
      <qti-gap-img identifier="DraggerA" match-max="1">
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
        <img
          src="assets/qti-graphic-gap-match-interaction/d-bay.png"
          alt="Choice D, Bay of Pigs"
          height="63"
          width="78"
        />
      </qti-gap-img>
      <qti-associable-hotspot coords="55,256,133,319" identifier="A" match-max="1" shape="rect"></qti-associable-hotspot>
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
      <qti-associable-hotspot
        coords="450,256,528,319"
        identifier="D"
        match-max="1"
        shape="rect"
      ></qti-associable-hotspot>
    </qti-graphic-gap-match-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector('[data-testid="graphic-gap-match-interaction"]') as QtiGraphicGapMatchInteraction;
    await settleInteraction(interaction);

    const draggerA = interaction.querySelector('qti-gap-img[identifier="DraggerA"]') as HTMLElement;
    const draggerB = interaction.querySelector('qti-gap-img[identifier="DraggerB"]') as HTMLElement;
    const draggerC = interaction.querySelector('qti-gap-img[identifier="DraggerC"]') as HTMLElement;
    const hotspotA = getHotspot(interaction, 'A');
    const hotspotB = getHotspot(interaction, 'B');
    const hotspotC = getHotspot(interaction, 'C');
    const hotspotD = getHotspot(interaction, 'D');

    const callback = fn((event: CustomEvent<{ response: string[] }>) => event.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Place A, B, C and keep D in inventory', async () => {
        await drag(draggerA, { to: hotspotA, duration: 300 });
        await settleInteraction(interaction);
        await drag(draggerB, { to: hotspotB, duration: 300 });
        await settleInteraction(interaction);
        await drag(draggerC, { to: hotspotC, duration: 300 });
        await settleInteraction(interaction);

        expect(hotspotA.querySelector('[identifier="DraggerA"]')).toBeTruthy();
        expect(hotspotB.querySelector('[identifier="DraggerB"]')).toBeTruthy();
        expect(hotspotC.querySelector('[identifier="DraggerC"]')).toBeTruthy();
        expect(hotspotD.querySelector('[identifier="DraggerD"]')).toBeFalsy();
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['DraggerA A', 'DraggerB B', 'DraggerC C']);
      });

      await step('Drag placed DraggerA from A onto occupied B and verify partial sortable swap', async () => {
        const placedDraggerA = getHotspot(interaction, 'A').querySelector('[identifier="DraggerA"]') as HTMLElement;
        await drag(placedDraggerA, { to: hotspotB, duration: 300 });
        await settleInteraction(interaction);

        expect(hotspotA.querySelector('[identifier="DraggerB"]')).toBeTruthy();
        expect(hotspotB.querySelector('[identifier="DraggerA"]')).toBeTruthy();
        expect(hotspotC.querySelector('[identifier="DraggerC"]')).toBeTruthy();
        expect(hotspotD.querySelector('[identifier="DraggerD"]')).toBeFalsy();
      });

      await step('Response remains partial and reflects swapped hotspots', async () => {
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['DraggerB A', 'DraggerA B', 'DraggerC C']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const BasicPlacementAndResponse: Story = {
  name: 'Behavior: basic placement and response emission',
  render: () => html`
    <qti-graphic-gap-match-interaction
      data-testid="graphic-gap-match-interaction"
      response-identifier="RESPONSE"
      max-associations="4"
    >
      <qti-prompt>Place each event tile on one hotspot.</qti-prompt>
      <img
        alt="timeline from 1939 to 1991"
        src="assets/qti-graphic-gap-match-interaction/timeline-558.png"
        height="326"
        width="558"
      />
      <qti-gap-img identifier="DraggerA" match-max="1">
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
        <img
          src="assets/qti-graphic-gap-match-interaction/d-bay.png"
          alt="Choice D, Bay of Pigs"
          height="63"
          width="78"
        />
      </qti-gap-img>
      <qti-associable-hotspot coords="55,256,133,319" identifier="A" match-max="1" shape="rect"></qti-associable-hotspot>
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
      <qti-associable-hotspot
        coords="450,256,528,319"
        identifier="D"
        match-max="1"
        shape="rect"
      ></qti-associable-hotspot>
    </qti-graphic-gap-match-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector('[data-testid="graphic-gap-match-interaction"]') as QtiGraphicGapMatchInteraction;
    await settleInteraction(interaction);

    const draggerA = interaction.querySelector('qti-gap-img[identifier="DraggerA"]') as HTMLElement;
    const draggerB = interaction.querySelector('qti-gap-img[identifier="DraggerB"]') as HTMLElement;
    const draggerC = interaction.querySelector('qti-gap-img[identifier="DraggerC"]') as HTMLElement;
    const draggerD = interaction.querySelector('qti-gap-img[identifier="DraggerD"]') as HTMLElement;
    const hotspotA = getHotspot(interaction, 'A');
    const hotspotB = getHotspot(interaction, 'B');
    const hotspotC = getHotspot(interaction, 'C');
    const hotspotD = getHotspot(interaction, 'D');

    const callback = fn((event: CustomEvent<{ response: string[] }>) => event.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Place tiles in A, B, C, D', async () => {
        await drag(draggerA, { to: hotspotA, duration: 300 });
        await settleInteraction(interaction);
        await drag(draggerB, { to: hotspotB, duration: 300 });
        await settleInteraction(interaction);
        await drag(draggerC, { to: hotspotC, duration: 300 });
        await settleInteraction(interaction);
        await drag(draggerD, { to: hotspotD, duration: 300 });
        await settleInteraction(interaction);

        expect(hotspotA.querySelector('[identifier="DraggerA"]')).toBeTruthy();
        expect(hotspotB.querySelector('[identifier="DraggerB"]')).toBeTruthy();
        expect(hotspotC.querySelector('[identifier="DraggerC"]')).toBeTruthy();
        expect(hotspotD.querySelector('[identifier="DraggerD"]')).toBeTruthy();
      });

      await step('Response contains directed pairs for all four placements', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['DraggerA A', 'DraggerB B', 'DraggerC C', 'DraggerD D']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const ResetAndProgrammaticResponse: Story = {
  name: 'Behavior: reset clears placements and response setter restores them',
  render: BasicPlacementAndResponse.render,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector('[data-testid="graphic-gap-match-interaction"]') as QtiGraphicGapMatchInteraction;
    await settleInteraction(interaction);

    const draggerA = interaction.querySelector('qti-gap-img[identifier="DraggerA"]') as HTMLElement;
    const draggerB = interaction.querySelector('qti-gap-img[identifier="DraggerB"]') as HTMLElement;
    const hotspotA = getHotspot(interaction, 'A');
    const hotspotB = getHotspot(interaction, 'B');
    const hotspotC = getHotspot(interaction, 'C');
    const hotspotD = getHotspot(interaction, 'D');

    await step('Create initial placements via drag', async () => {
      await drag(draggerA, { to: hotspotA, duration: 300 });
      await settleInteraction(interaction);
      await drag(draggerB, { to: hotspotB, duration: 300 });
      await settleInteraction(interaction);
      expect(hotspotA.querySelector('[identifier="DraggerA"]')).toBeTruthy();
      expect(hotspotB.querySelector('[identifier="DraggerB"]')).toBeTruthy();
    });

    await step('Reset clears all hotspots', async () => {
      interaction.reset();
      await settleInteraction(interaction);
      expect(hotspotA.querySelector('[qti-draggable="true"]')).toBeFalsy();
      expect(hotspotB.querySelector('[qti-draggable="true"]')).toBeFalsy();
      expect(hotspotC.querySelector('[qti-draggable="true"]')).toBeFalsy();
      expect(hotspotD.querySelector('[qti-draggable="true"]')).toBeFalsy();
    });

    await step('Programmatic response rebuilds placements', async () => {
      interaction.response = ['DraggerB A', 'DraggerA C', 'DraggerD D'];
      await settleInteraction(interaction);
      expect(hotspotA.querySelector('[identifier="DraggerB"]')).toBeTruthy();
      expect(hotspotC.querySelector('[identifier="DraggerA"]')).toBeTruthy();
      expect(hotspotD.querySelector('[identifier="DraggerD"]')).toBeTruthy();
    });
  }
};
