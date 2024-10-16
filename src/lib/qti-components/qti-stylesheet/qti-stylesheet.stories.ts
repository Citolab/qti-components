import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import '../qti-assessment-item/qti-assessment-item';
import '../qti-interaction/internal/choice/choice.mixin';
import '../qti-interaction/qti-choice-interaction/qti-choice-interaction';
import '../qti-item-body/qti-item-body';
import '../qti-stylesheet/qti-stylesheet';
import { QtiStylesheet } from '../qti-stylesheet/qti-stylesheet';

import inlineCSS from './inline.css?raw';

const meta = {
  component: 'qti-stylesheet'
} satisfies Meta<typeof QtiStylesheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args =>
    html`<qti-assessment-item>
      <qti-stylesheet href="/qti-stylesheet/linked.css" type="text/css"></qti-stylesheet>
      <qti-item-body>
        <qti-choice-interaction
          class="qti-orientation-horizontal qti-input-control-hidden"
          max-choices="1"
          shuffle="false"
        >
          <qti-simple-choice identifier="A"> Boer </qti-simple-choice>
          <qti-simple-choice identifier="B"> Doek </qti-simple-choice>
          <qti-simple-choice identifier="C"> Voet </qti-simple-choice>
        </qti-choice-interaction>
      </qti-item-body>
    </qti-assessment-item>`
};

export const Inline: Story = {
  render: args =>
    html`<qti-assessment-item>
      <qti-stylesheet type="text/css">${inlineCSS}</qti-stylesheet>
      <qti-item-body>
        <qti-choice-interaction
          class="qti-orientation-horizontal qti-input-control-hidden"
          max-choices="1"
          shuffle="false"
        >
          <qti-simple-choice identifier="A"> Boer </qti-simple-choice>
          <qti-simple-choice identifier="B"> Doek </qti-simple-choice>
          <qti-simple-choice identifier="C"> Voet </qti-simple-choice>
        </qti-choice-interaction>
      </qti-item-body>
    </qti-assessment-item>`
};
