import '@citolab/qti-components/qti-components';
import { QtiAnd, QtiConditionExpression } from '@citolab/qti-components/qti-components';
import { expect } from '@storybook/jest';
import { within } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

type Story = StoryObj; // <Props>;

const meta: Meta = {
  component: 'qti-and'
};
export default meta;

export const AllTrueResultsInTrue: Story = {
  render: args =>
    html` <qti-and>
      <mock-child response="true"></mock-child>
      <mock-child response="true"></mock-child>
      <mock-child response="true"></mock-child>
    </qti-and>`,
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const qtiAnd = canvasElement.querySelector('qti-and') as QtiAnd;
    expect(qtiAnd.calculate()).toBeTruthy();
  }
};

export const OneFalseResultsInFalse: Story = {
  render: args =>
    html` <qti-and>
      <mock-child response="true"></mock-child>
      <mock-child response="false"></mock-child>
      <mock-child response="true"></mock-child>
    </qti-and>`,
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const qtiAnd = canvasElement.querySelector('qti-and') as QtiAnd;
    expect(qtiAnd.calculate()).toBeFalsy();
  }
};

export class MockChild extends QtiConditionExpression {
  response = false;
  override connectedCallback() {
    super.connectedCallback();
    this.response = this.getAttribute('response') == 'true';
  }
  public override getResult() {
    return this.response;
  }
}
customElements.define('mock-child', MockChild);
