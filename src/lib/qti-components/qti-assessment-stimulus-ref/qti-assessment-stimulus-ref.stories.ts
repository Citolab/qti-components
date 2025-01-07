import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { createRef, ref } from 'lit/directives/ref.js';
import { QtiAssessmentStimulusRef } from './qti-assessment-stimulus-ref';

const meta = {
  component: 'qti-assessment-stimulus-ref'
} satisfies Meta<typeof QtiAssessmentStimulusRef>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StimulusWithRef: Story = {
  render: _args =>
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
            <qti-choice-interaction class="qti-orientation-horizontal qti-input-control-hidden" max-choices="1">
              <qti-simple-choice identifier="A"> Boer </qti-simple-choice>
              <qti-simple-choice identifier="B"> Doek </qti-simple-choice>
              <qti-simple-choice identifier="C"> Voet </qti-simple-choice>
            </qti-choice-interaction>
          </div>
        </div>
      </qti-item-body>
    </qti-assessment-item>`
};

/* An example of how to use the qti-assessment-stimulus-ref component to load a stimulus and append it to a placeholder element */
export const StimulusDeliveryPlatform: Story = {
  render: _args => {
    const placeholderRef = createRef<HTMLElement>();
    return html` <div
      @qti-assessment-stimulus-ref-connected=${async (e: Event) => {
        e.preventDefault(); // this prevents the default behaviour of the item to set the stimulus content
        const stimulusRef = e.target as QtiAssessmentStimulusRef;
        stimulusRef.updateStimulusRef(placeholderRef.value);
      }}
    >
      <div class="qti-shared-stimulus" ${ref(placeholderRef)}></div>
      <qti-assessment-item>
        <qti-assessment-stimulus-ref
          identifier="Stimulus1"
          href="qti-assessment-stimulus-ref/unbelievableNight.xml"
        ></qti-assessment-stimulus-ref>
        <div class="qti-layout-row">
          <div class="qti-layout-col6"></div>
          <div class="qti-layout-col6">
            <qti-choice-interaction class="qti-orientation-horizontal qti-input-control-hidden" max-choices="1">
              <qti-simple-choice identifier="A"> Boer </qti-simple-choice>
              <qti-simple-choice identifier="B"> Doek </qti-simple-choice>
              <qti-simple-choice identifier="C"> Voet </qti-simple-choice>
            </qti-choice-interaction>
          </div>
        </div>
      </qti-assessment-item>
    </div>`;
  }
};
