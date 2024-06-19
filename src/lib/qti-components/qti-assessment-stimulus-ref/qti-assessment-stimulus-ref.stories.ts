import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import '../qti-assessment-item/qti-assessment-item';
import '../qti-assessment-stimulus-ref/qti-assessment-stimulus-ref';
import { QtiAssessmentStimulusRef } from '../qti-assessment-stimulus-ref/qti-assessment-stimulus-ref';
import '../qti-interaction/internal/choice/qti-choice';
import '../qti-interaction/qti-choice-interaction/qti-choice-interaction';
import '../qti-item-body/qti-item-body';

const meta = {
  component: 'qti-assessment-stimulus-ref'
} satisfies Meta<typeof QtiAssessmentStimulusRef>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stimulus: Story = {
  render: args =>
    html`<qti-assessment-item>
      <qti-assessment-stimulus-ref
        identifier="Stimulus1"
        href="qti-assessment-stimulus-ref/unbelievableNight.xml"
      ></qti-assessment-stimulus-ref>
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

export const StimulusWithRef: Story = {
  render: args =>
    html`<qti-assessment-item>
      <qti-assessment-stimulus-ref
        identifier="Stimulus1"
        href="qti-assessment-stimulus-ref/unbelievableNight.xml"
        title="An Unbelievable Night"
      ></qti-assessment-stimulus-ref>
      <qti-item-body>
        <div class="qti-layout-row">
          <div class="qti-layout-col6">
            <div class="qti-shared-stimulus" data-stimulus-idref="Stimulus1"></div>
          </div>
          <div class="qti-layout-col6">
            <qti-choice-interaction
              class="qti-orientation-horizontal qti-input-control-hidden"
              max-choices="1"
              shuffle="false"
            >
              <qti-simple-choice identifier="A"> Boer </qti-simple-choice>
              <qti-simple-choice identifier="B"> Doek </qti-simple-choice>
              <qti-simple-choice identifier="C"> Voet </qti-simple-choice>
            </qti-choice-interaction>
          </div>
        </div>
      </qti-item-body>
    </qti-assessment-item>`
};
