import { QtiAnd } from './qti-and';
import { expect } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { QtiConditionExpression } from '../qti-condition-expression';

type Story = StoryObj; // <Props>;

const meta: Meta = {
  component: 'qti-and'
};
export default meta;

export const AllTrueResultsInTrue: Story = {
  render: () =>
    html` <qti-and>
      <mock-child response="true"></mock-child>
      <mock-child response="true"></mock-child>
      <mock-child response="true"></mock-child>
    </qti-and>`,
  play: ({ canvasElement }) => {
    const qtiAnd = canvasElement.querySelector('qti-and') as QtiAnd;
    expect(qtiAnd.calculate()).toBeTruthy();
  }
};

export const OneFalseResultsInFalse: Story = {
  render: _args =>
    html` <qti-and>
      <mock-child response="true"></mock-child>
      <mock-child response="false"></mock-child>
      <mock-child response="true"></mock-child>
    </qti-and>`,
  play: ({ canvasElement }) => {
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
