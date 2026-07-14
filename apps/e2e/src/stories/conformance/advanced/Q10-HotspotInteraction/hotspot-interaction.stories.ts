import { expect, fireEvent } from 'storybook/test';

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
    expect(validationMessage.style.display).toBe('block');
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
    (hotspotInteraction as any).configContext = {
      ...((hotspotInteraction as any).configContext || {}),
      validationDisplayMode: 'none'
    };
    const validationMessage = hotspotInteraction.shadowRoot?.querySelector('#validation-message') as HTMLElement;

    fireEvent.click(getHotspot(hotspotInteraction, 'A'));
    fireEvent.click(getHotspot(hotspotInteraction, 'B'));
    fireEvent.click(getHotspot(hotspotInteraction, 'C'));
    fireEvent.click(getHotspot(hotspotInteraction, 'D'));

    assessmentItem.processResponse();

    expect((interaction as any).internals.validity.valid).toBe(false);
    expect(validationMessage).toBeTruthy();
    expect(validationMessage.textContent).toBe('');
    expect(validationMessage.style.display).toBe('none');
  },
  loaders: [loaderSv2]
};
