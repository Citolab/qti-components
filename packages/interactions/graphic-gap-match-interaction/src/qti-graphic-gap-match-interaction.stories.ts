import { html } from 'lit';
import { expect, fn } from 'storybook/test';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import drag from '../../../../tools/testing/drag';

import type { QtiGraphicGapMatchInteraction } from './qti-graphic-gap-match-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-graphic-gap-match-interaction', {
  excludeCategories: ['methods', 'events', 'properties']
});

type Story = StoryObj<QtiGraphicGapMatchInteraction & typeof args>;

/**
 *
 * ### [3.2.14 Graphic Gap Match Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.7cs7637r54vv)
 * a graphical interaction with a set of gaps that are defined as areas (hotspots) of the graphic image and an additional set of gap choices that are defined outside the image. The candidate must associate the gap choices with the gaps in the image and be able to review the image with the gaps filled in context, as indicated by their choices.
 *
 */
const meta: Meta<QtiGraphicGapMatchInteraction> = {
  component: 'qti-graphic-gap-match-interaction',
  title: 'Interactions/Graphic Gap Match',
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
      <qti-associable-hotspot
        coords="55,256,133,319"
        identifier="A"
        match-max="1"
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
    </qti-graphic-gap-match-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector(
      '[data-testid="graphic-gap-match-interaction"]'
    ) as QtiGraphicGapMatchInteraction;
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

        expect(hotspotA.shadowRoot!.querySelector('[identifier="DraggerA"]')).toBeTruthy();
        expect(hotspotB.shadowRoot!.querySelector('[identifier="DraggerB"]')).toBeTruthy();
        expect(hotspotC.shadowRoot!.querySelector('[identifier="DraggerC"]')).toBeTruthy();
        expect(hotspotD.shadowRoot!.querySelector('[identifier="DraggerD"]')).toBeTruthy();
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual([
          'DraggerA A',
          'DraggerB B',
          'DraggerC C',
          'DraggerD D'
        ]);
      });

      await step('Drag placed DraggerA from A onto occupied B to trigger sortable swap', async () => {
        const placedDraggerA = getHotspot(interaction, 'A').shadowRoot!.querySelector(
          '[identifier="DraggerA"]'
        ) as HTMLElement;
        await drag(placedDraggerA, { to: hotspotB, duration: 300 });
        await settleInteraction(interaction);

        expect(hotspotA.shadowRoot!.querySelector('[identifier="DraggerB"]')).toBeTruthy();
        expect(hotspotB.shadowRoot!.querySelector('[identifier="DraggerA"]')).toBeTruthy();
        expect(hotspotC.shadowRoot!.querySelector('[identifier="DraggerC"]')).toBeTruthy();
        expect(hotspotD.shadowRoot!.querySelector('[identifier="DraggerD"]')).toBeTruthy();
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
      <qti-associable-hotspot
        coords="55,256,133,319"
        identifier="A"
        match-max="1"
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
    </qti-graphic-gap-match-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector(
      '[data-testid="graphic-gap-match-interaction"]'
    ) as QtiGraphicGapMatchInteraction;
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

        expect(hotspotA.shadowRoot!.querySelector('[identifier="DraggerA"]')).toBeTruthy();
        expect(hotspotB.shadowRoot!.querySelector('[identifier="DraggerB"]')).toBeTruthy();
        expect(hotspotC.shadowRoot!.querySelector('[identifier="DraggerC"]')).toBeTruthy();
        expect(hotspotD.shadowRoot!.querySelector('[identifier="DraggerD"]')).toBeFalsy();
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['DraggerA A', 'DraggerB B', 'DraggerC C']);
      });

      await step('Drag placed DraggerA from A onto occupied B and verify partial sortable swap', async () => {
        const placedDraggerA = getHotspot(interaction, 'A').shadowRoot!.querySelector(
          '[identifier="DraggerA"]'
        ) as HTMLElement;
        await drag(placedDraggerA, { to: hotspotB, duration: 300 });
        await settleInteraction(interaction);

        expect(hotspotA.shadowRoot!.querySelector('[identifier="DraggerB"]')).toBeTruthy();
        expect(hotspotB.shadowRoot!.querySelector('[identifier="DraggerA"]')).toBeTruthy();
        expect(hotspotC.shadowRoot!.querySelector('[identifier="DraggerC"]')).toBeTruthy();
        expect(hotspotD.shadowRoot!.querySelector('[identifier="DraggerD"]')).toBeFalsy();
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
      <qti-associable-hotspot
        coords="55,256,133,319"
        identifier="A"
        match-max="1"
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
    </qti-graphic-gap-match-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector(
      '[data-testid="graphic-gap-match-interaction"]'
    ) as QtiGraphicGapMatchInteraction;
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

        expect(hotspotA.shadowRoot!.querySelector('[identifier="DraggerA"]')).toBeTruthy();
        expect(hotspotB.shadowRoot!.querySelector('[identifier="DraggerB"]')).toBeTruthy();
        expect(hotspotC.shadowRoot!.querySelector('[identifier="DraggerC"]')).toBeTruthy();
        expect(hotspotD.shadowRoot!.querySelector('[identifier="DraggerD"]')).toBeTruthy();
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
    const interaction = canvasElement.querySelector(
      '[data-testid="graphic-gap-match-interaction"]'
    ) as QtiGraphicGapMatchInteraction;
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
      expect(hotspotA.shadowRoot!.querySelector('[identifier="DraggerA"]')).toBeTruthy();
      expect(hotspotB.shadowRoot!.querySelector('[identifier="DraggerB"]')).toBeTruthy();
    });

    await step('Reset clears all hotspots', async () => {
      interaction.reset();
      await settleInteraction(interaction);
      expect(hotspotA.shadowRoot!.querySelector('[qti-draggable="true"]')).toBeFalsy();
      expect(hotspotB.shadowRoot!.querySelector('[qti-draggable="true"]')).toBeFalsy();
      expect(hotspotC.shadowRoot!.querySelector('[qti-draggable="true"]')).toBeFalsy();
      expect(hotspotD.shadowRoot!.querySelector('[qti-draggable="true"]')).toBeFalsy();
    });

    await step('Programmatic response rebuilds placements', async () => {
      interaction.response = ['DraggerB A', 'DraggerA C', 'DraggerD D'];
      await settleInteraction(interaction);
      expect(hotspotA.shadowRoot!.querySelector('[identifier="DraggerB"]')).toBeTruthy();
      expect(hotspotC.shadowRoot!.querySelector('[identifier="DraggerA"]')).toBeTruthy();
      expect(hotspotD.shadowRoot!.querySelector('[identifier="DraggerD"]')).toBeTruthy();
    });
  }
};

/** An SVG image as a data URL, so a story needs no asset file. */
const svgImage = (width: number, height: number, body: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`)}`;

/** A 1600x893 "map" with four places, each marked where its 275x126 drop area is drawn. */
const WIDE_MAP = svgImage(
  1600,
  893,
  `<rect width="1600" height="893" fill="#a9d3ee"/><path d="M60 120 L1300 60 L1340 820 L80 860 Z" fill="#d7e3b5" stroke="#555" stroke-width="4"/>` +
    [
      [79, 322, 'Place 1'],
      [241, 478, 'Place 2'],
      [716, 288, 'Place 3'],
      [1008, 689, 'Place 4']
    ]
      .map(
        ([x, y, name]) =>
          `<rect x="${x}" y="${y}" width="275" height="126" fill="none" stroke="#888" stroke-dasharray="12 8" stroke-width="3"/><text x="${Number(x) + 137}" y="${Number(y) + 75}" font-family="Arial" font-size="40" text-anchor="middle">${name}</text>`
      )
      .join('')
);

/** A text tile, drawn at twice its 275x126 display size. */
const tile = (text: string) =>
  svgImage(
    550,
    252,
    `<rect x="2" y="2" width="546" height="248" rx="12" fill="#fff" stroke="#4b5563" stroke-width="4"/><text x="275" y="140" font-family="Arial" font-weight="bold" font-size="48" text-anchor="middle">${text}</text>`
  );

/**
 * A graphic declared wider than its column (1600px in 480px), each drop area drawn for a tile of the same size: the
 * drop areas and the tiles scale with the graphic, in the bank and in a hotspot, and a drop lands where it is aimed.
 */
export const TilesScaleWithTheGraphic: Story = {
  name: 'Behavior: tiles scale with a wide graphic',
  render: () => html`
    <div style="width: 480px">
      <qti-graphic-gap-match-interaction
        data-testid="graphic-gap-match-interaction"
        response-identifier="RESPONSE"
        max-associations="0"
      >
        <img alt="A map with four places" src=${WIDE_MAP} width="1600" height="893" />
        ${[1, 2, 3, 4].map(
          n =>
            html`<qti-gap-img identifier=${`T${n}`} match-max="1"
              ><img src=${tile(`Tile ${n}`)} alt=${`Tile ${n}`} width="275" height="126"
            /></qti-gap-img>`
        )}
        <qti-associable-hotspot
          identifier="H1"
          match-max="1"
          shape="rect"
          coords="79,322,354,448"
        ></qti-associable-hotspot>
        <qti-associable-hotspot
          identifier="H2"
          match-max="1"
          shape="rect"
          coords="241,478,516,604"
        ></qti-associable-hotspot>
        <qti-associable-hotspot
          identifier="H3"
          match-max="1"
          shape="rect"
          coords="716,288,991,414"
        ></qti-associable-hotspot>
        <qti-associable-hotspot
          identifier="H4"
          match-max="1"
          shape="rect"
          coords="1008,689,1283,815"
        ></qti-associable-hotspot>
      </qti-graphic-gap-match-interaction>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector(
      '[data-testid="graphic-gap-match-interaction"]'
    ) as QtiGraphicGapMatchInteraction;
    await settleInteraction(interaction);
    const scale = (interaction.querySelector(':scope > img') as HTMLElement).getBoundingClientRect().width / 1600;
    const hotspot = (id: string) =>
      interaction.querySelector(`qti-associable-hotspot[identifier="${id}"]`) as HTMLElement;
    const chip = (id: string) => interaction.querySelector(`qti-gap-img[identifier="${id}"]`) as HTMLElement;

    await step('the drop areas and the tiles scale with the graphic', async () => {
      expect(scale).toBeLessThan(0.5);
      for (const element of [hotspot('H1'), hotspot('H4'), chip('T1'), chip('T4')]) {
        const rect = element.getBoundingClientRect();
        expect(rect.width).toBeCloseTo(275 * scale, 0);
        expect(rect.height).toBeCloseTo(126 * scale, 0);
      }
    });

    await step('a tile dropped on a place lands there, at the size of its drop area', async () => {
      await drag(chip('T1'), { to: hotspot('H2'), duration: 300 });
      await new Promise(resolve => setTimeout(resolve, 200));
      expect((interaction as QtiGraphicGapMatchInteraction & { response: unknown }).response).toEqual('T1 H2');
      const placed = hotspot('H2').shadowRoot!.querySelector('qti-gap-img') as HTMLElement;
      expect(placed.getBoundingClientRect().width).toBeCloseTo(275 * scale, 0);
    });
  }
};
