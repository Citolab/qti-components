import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './qti-order-interaction-in-place';

const meta: Meta = {
  component: 'qti-order-interaction-in-place',
  parameters: {
    docs: {
      description: {
        component:
          'QTI Order In Place Interaction - allows users to reorder items that are already placed in a container.'
      }
    }
  },
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
      description: 'Orientation of the items'
    }
  }
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    orientation: 'vertical'
  },
  render: args => html`
    <qti-order-interaction-in-place response-identifier="RESPONSE" orientation="${args.orientation}">
      <qti-prompt> Arrange the following historical events in chronological order (earliest first): </qti-prompt>
      <qti-simple-choice identifier="ww1">World War I begins (1914)</qti-simple-choice>
      <qti-simple-choice identifier="titanic">Titanic sinks (1912)</qti-simple-choice>
      <qti-simple-choice identifier="ww2">World War II begins (1939)</qti-simple-choice>
      <qti-simple-choice identifier="moon">Moon landing (1969)</qti-simple-choice>
      <qti-simple-choice identifier="berlin">Berlin Wall falls (1989)</qti-simple-choice>
    </qti-order-interaction-in-place>
  `
};

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal'
  },
  render: args => html`
    <qti-order-interaction-in-place response-identifier="RESPONSE" orientation="${args.orientation}">
      <qti-prompt> Arrange the planets in order from the Sun: </qti-prompt>
      <qti-simple-choice identifier="earth">Earth</qti-simple-choice>
      <qti-simple-choice identifier="mars">Mars</qti-simple-choice>
      <qti-simple-choice identifier="mercury">Mercury</qti-simple-choice>
      <qti-simple-choice identifier="venus">Venus</qti-simple-choice>
    </qti-order-interaction-in-place>
  `
};

export const WithManyItems: Story = {
  args: {
    orientation: 'vertical'
  },
  render: args => html`
    <qti-order-interaction-in-place response-identifier="RESPONSE" orientation="${args.orientation}">
      <qti-prompt> Arrange the numbers in ascending order: </qti-prompt>
      <qti-simple-choice identifier="seven">7</qti-simple-choice>
      <qti-simple-choice identifier="three">3</qti-simple-choice>
      <qti-simple-choice identifier="nine">9</qti-simple-choice>
      <qti-simple-choice identifier="one">1</qti-simple-choice>
      <qti-simple-choice identifier="five">5</qti-simple-choice>
      <qti-simple-choice identifier="eight">8</qti-simple-choice>
      <qti-simple-choice identifier="two">2</qti-simple-choice>
      <qti-simple-choice identifier="six">6</qti-simple-choice>
      <qti-simple-choice identifier="four">4</qti-simple-choice>
    </qti-order-interaction-in-place>
  `
};
