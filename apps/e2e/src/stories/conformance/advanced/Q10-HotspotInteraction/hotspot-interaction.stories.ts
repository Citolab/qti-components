import { expect, fireEvent, waitFor } from 'storybook/test';

import { getItemByUri } from '@qti-components/loader';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiHotspotInteraction } from '@qti-components/interactions';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q10 - Hotspot Interaction',
  beforeEach: async () => {}
};
export default meta;

const getElements = (canvasElement: HTMLElement) => {
  const assessmentItem = (canvasElement.querySelector('qti-assessment-item') ||
    canvasElement.querySelector('qti-item qti-assessment-item')) as QtiAssessmentItem;
  const hotspotInteraction = assessmentItem.querySelector('qti-hotspot-interaction') as QtiHotspotInteraction;
  return { assessmentItem, hotspotInteraction };
};

const getHotspot = (hotspotInteraction: QtiHotspotInteraction, identifier: string) =>
  hotspotInteraction.querySelector(`qti-hotspot-choice[identifier="${identifier}"]`) as HTMLElement;

const getResponse = (assessmentItem: QtiAssessmentItem, identifier = 'RESPONSE') =>
  assessmentItem.variables.find(v => v.identifier === identifier)?.value;

const loaderMultiple = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q10-hotspot/hotspot-interaction-multiple.xml')
});

const loaderShapes = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q10-hotspot/hotspot-interaction-shapes.xml')
});

const loaderSingle = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q10-hotspot/hotspot-interaction-single.xml')
});

const loaderSv1 = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q10-hotspot/hotspot-sv-1.xml')
});

const loaderSv2 = async () => ({
  xml: await getItemByUri('/assets/qti-conformance/Advanced/Q10-hotspot/hotspot-sv-2.xml')
});

// Q10-L2-D1: Multiple cardinality with no selection -> RESPONSE is NULL
export const Q10_L2_D1: Story = {
  name: 'Q10-L2-D1',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toBeNull();
  },
  loaders: [loaderMultiple]
};

// Q10-L2-D2: Multiple cardinality selecting A, B, D -> RESPONSE is ['A', 'B', 'D']
export const Q10_L2_D2: Story = {
  name: 'Q10-L2-D2',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hotspotInteraction } = getElements(canvasElement);

    fireEvent.click(getHotspot(hotspotInteraction, 'A'));
    fireEvent.click(getHotspot(hotspotInteraction, 'B'));
    fireEvent.click(getHotspot(hotspotInteraction, 'D'));

    assessmentItem.processResponse();
    expect(Array.isArray(getResponse(assessmentItem))).toBe(true);
    expect(getResponse(assessmentItem)).toEqual(['A', 'B', 'D']);
  },
  loaders: [loaderMultiple]
};

// Q10-L2-D3: Shapes example selecting i4 -> RESPONSE is 'i4'
export const Q10_L2_D3: Story = {
  name: 'Q10-L2-D3',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hotspotInteraction } = getElements(canvasElement);

    fireEvent.click(getHotspot(hotspotInteraction, 'i4'));

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toBe('i4');
  },
  loaders: [loaderShapes]
};

// Q10-L2-D4: Single cardinality selecting C -> RESPONSE is 'C'
export const Q10_L2_D4: Story = {
  name: 'Q10-L2-D4',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hotspotInteraction } = getElements(canvasElement);

    fireEvent.click(getHotspot(hotspotInteraction, 'C'));

    assessmentItem.processResponse();
    expect(getResponse(assessmentItem)).toBe('C');
  },
  loaders: [loaderSingle]
};

// Q10-L2-D101: SV1 classes are imported on each hotspot interaction (light/dark + unselected-hidden variants)
export const Q10_L2_D101: Story = {
  name: 'Q10-L2-D101',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem } = getElements(canvasElement);
    const interactions = Array.from(assessmentItem.querySelectorAll('qti-hotspot-interaction')) as HTMLElement[];

    expect(interactions.length).toBe(4);
    expect(interactions[0].classList.contains('qti-selections-light')).toBe(true);
    expect(interactions[1].classList.contains('qti-selections-dark')).toBe(true);
    expect(interactions[2].classList.contains('qti-selections-light')).toBe(true);
    expect(interactions[2].classList.contains('qti-unselected-hidden')).toBe(true);
    expect(interactions[3].classList.contains('qti-selections-dark')).toBe(true);
    expect(interactions[3].classList.contains('qti-unselected-hidden')).toBe(true);

    /*
     * The assertions above only prove the classes survived import. They passed for as long as this
     * story has existed while the theme had no hotspot selections rules at all, so on their own they
     * are not coverage — hence the computed-style checks below.
     */
    const firstHotspot = (interaction: HTMLElement) => interaction.querySelector('qti-hotspot-choice') as HTMLElement;

    // A selection is themed differently under light than under dark. §3.2.6 requires only that a
    // selection be clearly indicated; what makes these classes worth having is that they differ.
    const [light, dark] = [interactions[0], interactions[1]].map(firstHotspot);
    for (const hotspot of [light, dark]) {
      await fireEvent.click(hotspot);
    }
    // The base rule transitions background-color over 150ms, so a read taken straight after the
    // click lands mid-interpolation and reports something close to transparent. waitFor retries
    // until it has settled.
    const bgOf = (el: HTMLElement) => getComputedStyle(el).backgroundColor;
    await waitFor(() => {
      expect(bgOf(light), 'a light selection is painted').not.toBe('rgba(0, 0, 0, 0)');
      expect(bgOf(dark), 'a dark selection is painted').not.toBe('rgba(0, 0, 0, 0)');
      expect(bgOf(light), 'light and dark selections differ').not.toBe(bgOf(dark));
    });

    /*
     * qti-unselected-hidden, §3.2.6: "the delivery engine must hide the hotspots in their
     * unselected and unfocused state."
     *
     * Only half of this is assertable. An unselected hotspot must be invisible and a selected one
     * must not be, and both are checked below. The other half of what the class does — suppressing
     * the hover reveal, so sweeping a mouse across the picture does not hand back the answer
     * regions — cannot be driven from here: CSS :hover follows real pointer position and does not
     * respond to a synthetic mouseOver. It is covered by the rule's own comment in
     * qti-hotspot-interaction.css and needs an eye on the story.
     *
     * The resting check is also weak on its own: this theme paints no fill on any unselected
     * hotspot, so it would pass with the class absent. It stands as a regression guard for the day
     * hotspots get a visible resting affordance, not as proof the class works today.
     */
    const hiddenHotspot = firstHotspot(interactions[2]);
    expect(bgOf(hiddenHotspot), 'unselected is hidden').toBe('rgba(0, 0, 0, 0)');

    await fireEvent.click(hiddenHotspot);
    await waitFor(() => expect(bgOf(hiddenHotspot), 'selecting it reveals it').not.toBe('rgba(0, 0, 0, 0)'));
  },
  loaders: [loaderSv1]
};

// Q10-L2-D102: SV2 min/max selection message attributes are imported and max-choices is enforced
export const Q10_L2_D102: Story = {
  name: 'Q10-L2-D102',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hotspotInteraction } = getElements(canvasElement);
    const interaction = hotspotInteraction as HTMLElement;
    const validationMessage = hotspotInteraction.shadowRoot?.querySelector('#validation-message') as HTMLElement;

    expect(interaction.getAttribute('min-choices')).toBe('1');
    expect(interaction.getAttribute('max-choices')).toBe('3');
    expect(interaction.getAttribute('data-min-selections-message')).toBe('Please choose at least one city.');
    expect(interaction.getAttribute('data-max-selections-message')).toBe("You've chosen too many cities!");

    fireEvent.click(getHotspot(hotspotInteraction, 'A'));
    fireEvent.click(getHotspot(hotspotInteraction, 'B'));
    fireEvent.click(getHotspot(hotspotInteraction, 'C'));
    fireEvent.click(getHotspot(hotspotInteraction, 'D'));

    assessmentItem.processResponse();

    const response = getResponse(assessmentItem, 'RESPONSE1');
    expect(Array.isArray(response)).toBe(true);
    expect(response).toEqual(['A', 'B', 'C', 'D']);

    expect(validationMessage).toBeTruthy();
    expect(validationMessage.textContent).toBe("You've chosen too many cities!");
    expect(validationMessage).toBeVisible();
  },
  loaders: [loaderSv2]
};

// Q10-L2-D103: validationDisplayMode='none' keeps validity state but suppresses inline validation message
export const Q10_L2_D103: Story = {
  name: 'Q10-L2-D103',
  render: (_, { loaded: { xml } }) => xml,
  play: async ({ canvasElement }) => {
    const { assessmentItem, hotspotInteraction } = getElements(canvasElement);
    const interaction = hotspotInteraction as HTMLElement;

    const validationMessage = hotspotInteraction.shadowRoot?.querySelector('#validation-message') as HTMLElement;

    fireEvent.click(getHotspot(hotspotInteraction, 'A'));
    fireEvent.click(getHotspot(hotspotInteraction, 'B'));
    fireEvent.click(getHotspot(hotspotInteraction, 'C'));
    fireEvent.click(getHotspot(hotspotInteraction, 'D'));

    assessmentItem.processResponse();

    expect((interaction as any).internals.validity.valid).toBe(false);
    expect(validationMessage).toBeTruthy();
    expect(validationMessage).toBeVisible();
  },
  loaders: [loaderSv2]
};
