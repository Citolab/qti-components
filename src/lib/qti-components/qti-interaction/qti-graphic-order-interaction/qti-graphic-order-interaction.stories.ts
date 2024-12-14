import { html } from 'lit';

import './qti-graphic-order-interaction';
import '../../qti-interaction/qti-hotspot-choice';

export default {
  component: 'qti-graphic-order-interaction'
};

export const Default = {
  render: () =>
    html` <qti-graphic-order-interaction max-choices="0" response-identifier="RESPONSE1">
      <img src="qti-graphic-order-interaction/uk.png" height="280" width="206" />
      <qti-hotspot-choice coords="78,102,8" identifier="A" shape="circle"></qti-hotspot-choice>
      <qti-hotspot-choice coords="117,171,8" identifier="B" shape="circle"></qti-hotspot-choice>
      <qti-hotspot-choice coords="166,227,8" identifier="C" shape="circle"></qti-hotspot-choice>
      <qti-hotspot-choice coords="100,102,8" identifier="D" shape="circle"></qti-hotspot-choice>
    </qti-graphic-order-interaction>`
};
