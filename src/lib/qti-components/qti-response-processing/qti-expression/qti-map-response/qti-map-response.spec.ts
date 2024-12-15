import '../../../../../index';
import { html, render } from 'lit';
import { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';
import { QtiMapResponse } from './qti-map-response';
describe('qti-map-response', () => {
  it('should the value of the mapping by response value', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="interaction_1" cardinality="single" base-type="string">
          <qti-correct-response>
            <qti-value>a</qti-value>
          </qti-correct-response>
          <qti-mapping default-value="0">
            <qti-map-entry map-key="a" mapped-value="0"></qti-map-entry>
            <qti-map-entry map-key="b" mapped-value="1"></qti-map-entry>
          </qti-mapping>
        </qti-response-declaration>

        <qti-map-response identifier="interaction_1"></qti-map-response>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    // (assessmentItem.variables.find(vr => vr.identifier === 'interaction_1') as ResponseVariable).value = 'b';
    // assessmentItem.getVariable('interaction_1').value = 'b';
    assessmentItem.updateResponseVariable('interaction_1', 'b');

    const qtiMapResponse = document.body.querySelector('qti-map-response') as QtiMapResponse;
    expect(qtiMapResponse.calculate()).toEqual(1);
  });
});
