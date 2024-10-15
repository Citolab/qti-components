import { html } from 'lit';
import { Default as Associate } from '../../lib/qti-components/qti-interaction/qti-associate-interaction/qti-associate-interaction.stories';
import { Default as Choice } from '../../lib/qti-components/qti-interaction/qti-choice-interaction/qti-choice-interaction.stories';
import { Default as ExtendedText } from '../../lib/qti-components/qti-interaction/qti-extended-text-interaction/qti-extended-text-interaction.stories';
import { Default as GapMatch } from '../../lib/qti-components/qti-interaction/qti-gap-match-interaction/qti-gap-match-interaction.stories';
import { Default as GraphicAssociate } from '../../lib/qti-components/qti-interaction/qti-graphic-associate-interaction/qti-graphic-associate-interaction.stories';
import { Default as GraphicGapMatch } from '../../lib/qti-components/qti-interaction/qti-graphic-gap-match-interaction/qti-graphic-gap-match-interaction.stories';
import { Default as GraphicOrder } from '../../lib/qti-components/qti-interaction/qti-graphic-order-interaction/qti-graphic-order-interaction.stories';
import { Poly as HotSpot } from '../../lib/qti-components/qti-interaction/qti-hotspot-interaction/qti-hotspot-interaction.stories';
import { Default as Hottext } from '../../lib/qti-components/qti-interaction/qti-hottext-interaction/qti-hottext-interaction.stories';
import { Default as InlineChoice } from '../../lib/qti-components/qti-interaction/qti-inline-choice-interaction/qti-inline-choice-interaction.stories';
import { Default as Match } from '../../lib/qti-components/qti-interaction/qti-match-interaction/qti-match-interaction.stories';
import { Default as Media } from '../../lib/qti-components/qti-interaction/qti-media-interaction/qti-media-interaction.stories';
import { Default as Order } from '../../lib/qti-components/qti-interaction/qti-order-interaction/qti-order-interaction.stories';
import { Default as PositionObject } from '../../lib/qti-components/qti-interaction/qti-position-object-interaction/qti-position-object-interaction.stories';
import { Default as SelectPoint } from '../../lib/qti-components/qti-interaction/qti-select-point-interaction/qti-select-point-interaction.stories';
import { Default as Slider } from '../../lib/qti-components/qti-interaction/qti-slider-interaction/qti-slider-interaction.stories';
import { Default as TextEntry } from '../../lib/qti-components/qti-interaction/qti-text-entry-interaction/qti-text-entry-interaction.stories';
// import { Default as Upload } from '../lib/qti-components/qti-interaction/qti-upload-interaction/qti-upload-interaction.stories';
// import { Default as Drawing } from '../lib/qti-components/qti-interaction/qti-drawing-interaction/qti-drawing-interaction.stories';
// import { Default as EndAttempt } from '../lib/qti-components/qti-interaction/qti-end-attempt-interaction/qti-end-attempt-interaction.stories';
// import { Default as Custom } from '../lib/qti-components/qti-interaction/qti-custom-interaction/qti-custom-interaction.stories';

export { Choice };

export default {
  title: 'styles/themes'
};
export const Interactions = args => html`
  <h2>qti-gap-match-interaction</h2>
  ${GapMatch.render({})}
  <h2>qti-match-interaction</h2>
  ${Match.render({})}
  <h2>qti-order-interaction</h2>
  ${Order.render({})}
  <h2>qti-associate-interaction</h2>
  ${Associate.render({})}
  <h2>qti-graphic-gap-match-interaction</h2>
  ${GraphicGapMatch.render({})}

  <h2>qti-choice-interaction</h2>
  <qti-layout-row>
    <qti-layout-col6>${Choice.render({})}</qti-layout-col6>
    <qti-layout-col6> ${Choice.render({ disabled: true, 'max-choices': 2 })}</qti-layout-col6>
  </qti-layout-row>
  ${Choice.render({
    orientation: 'vertical',
    classes: ['qti-input-control-hidden', 'qti-choices-stacking-2']
  })}

  <h2>qti-text-entry-interaction</h2>
  ${TextEntry.render({})}
  <h2>qti-extended-text-interaction</h2>
  ${ExtendedText.render({})}

  <h2>qti-hotspot-interaction</h2>
  ${HotSpot.render()}
  <h2>qti-hottext-interaction</h2>
  ${Hottext.render({ 'max-choices': '1' })} ${Hottext.render({ 'max-choices': '2' })}
  ${Hottext.render({ classes: ['qti-input-control-hidden'] })}
  <h2>qti-inline-choice-interaction</h2>
  ${InlineChoice.render({})}
  <h2>qti-graphic-order-interaction</h2>
  ${GraphicOrder.render({})}
  <h2>qti-graphic-associate-interaction</h2>
  ${GraphicAssociate.render({})}
  <h2>qti-media-interaction</h2>
  ${Media.render({})}
  <h2>qti-position-object-interaction</h2>
  ${PositionObject.render({})}
  <h2>qti-select-point-interaction</h2>
  ${SelectPoint.render({})}
  <h2>qti-slider-interaction</h2>
  ${Slider.render({})}
  <!-- 
  <div>Upload.render({})</div>
  <div>Drawing.render({})</div>
  <div>EndAttempt.render({})</div>
  <div>Custom.render({})</div>
  -->

  <!-- <div>PortableCustom.render({})</div>
    -->
  <!-- </qti-item-body> -->
`;
