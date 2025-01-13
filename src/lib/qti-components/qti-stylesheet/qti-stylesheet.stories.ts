import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { QtiStylesheet } from '../qti-stylesheet/qti-stylesheet';

import inlineCSS from '../../../../public/assets/qti-stylesheet/linked.css?inline';

const meta = {
  component: 'qti-stylesheet'
} satisfies Meta<typeof QtiStylesheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () =>
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
  render: () =>
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
