import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import drag from '../../../../../tools/testing/drag';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '@qti-components/interactions-core/elements/qti-simple-choice';
import type { QtiOrderInteraction } from '../qti-order-interaction';

type Story = StoryObj<QtiOrderInteraction>;

const meta: Meta<QtiOrderInteraction> = {
  component: 'qti-order-interaction',
  title: '10 Order/Vocabulary',
  tags: ['vocabulary', 'specific', 'iol']
};
export default meta;

const settle = async (interaction: QtiOrderInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const renderWithClass = (klass: string) => html`
  <qti-order-interaction data-testid="interaction" class="${klass}" response-identifier="RESPONSE">
    <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
    <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
    <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
  </qti-order-interaction>
`;

const xCenter = (el: Element) => {
  const rect = el.getBoundingClientRect();
  return rect.left + rect.width / 2;
};

const yCenter = (el: Element) => {
  const rect = el.getBoundingClientRect();
  return rect.top + rect.height / 2;
};

export const ChoicesTopClass: Story = {
  name: 'Class: qti-choices-top places source choices above dropzones',
  render: () => renderWithClass('qti-choices-top'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const firstDrop = canvas.queryAllByShadowRole('region')[0];

    expect(yCenter(choiceA)).toBeLessThan(yCenter(firstDrop));
  }
};

export const ChoicesBottomClass: Story = {
  name: 'Class: qti-choices-bottom places source choices below dropzones',
  render: () => renderWithClass('qti-choices-bottom'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const firstDrop = canvas.queryAllByShadowRole('region')[0];

    expect(yCenter(choiceA)).toBeGreaterThan(yCenter(firstDrop));
  }
};

export const ChoicesLeftClass: Story = {
  name: 'Class: qti-choices-left places source choices left of dropzones',
  render: () => renderWithClass('qti-choices-left'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const firstDrop = canvas.queryAllByShadowRole('region')[0];

    expect(xCenter(choiceA)).toBeLessThan(xCenter(firstDrop));
  }
};

export const ChoicesRightClass: Story = {
  name: 'Class: qti-choices-right places source choices right of dropzones',
  render: () => renderWithClass('qti-choices-right'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const firstDrop = canvas.queryAllByShadowRole('region')[0];

    expect(xCenter(choiceA)).toBeGreaterThan(xCenter(firstDrop));
  }
};

export const OrientationHorizontalClass: Story = {
  name: 'Class: qti-orientation-horizontal keeps drag bank in a row',
  render: () => html`
    <qti-order-interaction data-testid="interaction" class="qti-orientation-horizontal" response-identifier="RESPONSE">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');

    expect(Math.abs(yCenter(choiceA) - yCenter(choiceB))).toBeLessThan(2);
    expect(xCenter(choiceA)).toBeLessThan(xCenter(choiceB));
  }
};

export const OrientationVerticalClass: Story = {
  name: 'Class: qti-orientation-vertical stacks drag bank in a column',
  render: () => html`
    <qti-order-interaction data-testid="interaction" class="qti-orientation-vertical" response-identifier="RESPONSE">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');

    expect(Math.abs(xCenter(choiceA) - xCenter(choiceB))).toBeLessThan(2);
    expect(yCenter(choiceA)).toBeLessThan(yCenter(choiceB));
  }
};

export const ChoicesContainerWidthAttribute: Story = {
  name: 'Attribute: data-choices-container-width sets dropzone width in px',
  render: () => html`
    <qti-order-interaction
      data-testid="interaction"
      response-identifier="RESPONSE"
      orientation="horizontal"
      data-choices-container-width="220"
    >
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    const drops = canvas.queryAllByShadowRole('region');
    const widths = drops.map(drop => Math.round(drop.getBoundingClientRect().width));

    widths.forEach(width => expect(width).toBe(220));
  }
};

export const MaxSelectionsMessageAttribute: Story = {
  name: 'Attribute: data-max-selections-message is used for max validation text',
  render: () => html`
    <qti-order-interaction
      data-testid="interaction"
      response-identifier="RESPONSE"
      max-associations="1"
      data-max-selections-message="No more than one choice allowed"
      .configContext=${{ disableAfterMaxReached: false }}
    >
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');
    const drops = canvas.queryAllByShadowRole('region');

    await drag(choiceA, { to: drops[0], duration: 300 });
    await settle(interaction);
    await drag(choiceB, { to: drops[1], duration: 300 });
    await settle(interaction);

    expect(interaction.validate()).toBe(false);
    expect(interaction.internals.validationMessage).toBe('No more than one choice allowed');

    expect(interaction.reportValidity()).toBe(false);
    await settle(interaction);

    const message = interaction.shadowRoot?.querySelector<HTMLElement>('#validation-message');
    const drags = interaction.shadowRoot?.querySelector<HTMLElement>("slot[part~='drags']");
    const dropGroup = interaction.shadowRoot?.querySelector<HTMLElement>("[part='drops']");

    expect(message).toBeTruthy();
    expect(drags).toBeTruthy();
    expect(dropGroup).toBeTruthy();

    const contentBottom = Math.max(drags!.getBoundingClientRect().bottom, dropGroup!.getBoundingClientRect().bottom);
    expect(message!.getBoundingClientRect().top).toBeGreaterThanOrEqual(contentBottom - 1);
  }
};

export const MinSelectionsMessageAttribute: Story = {
  name: 'Attribute: data-min-selections-message is used for min validation text',
  render: () => html`
    <qti-order-interaction
      data-testid="interaction"
      response-identifier="RESPONSE"
      min-associations="2"
      data-min-selections-message="Select at least two choices"
    >
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const drops = canvas.queryAllByShadowRole('region');

    await drag(choiceA, { to: drops[0], duration: 300 });
    await settle(interaction);

    expect(interaction.validate()).toBe(false);
    expect(interaction.internals.validationMessage).toBe('Select at least two choices');
  }
};
