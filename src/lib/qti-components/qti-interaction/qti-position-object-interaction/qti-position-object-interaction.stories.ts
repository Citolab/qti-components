import { html } from 'lit';

import './qti-position-object-interaction';
import './qti-position-object-stage';

export default {
  component: 'qti-select-point-interaction'
};

export const Default = {
  render: args =>
    html`<qti-position-object-stage>
      <img src="https://qti-convert.web.app/images/uk.png" width="206" height="280" />
      <qti-position-object-interaction response-identifier="RESPONSE" max-choices="3">
        <img src="https://qti-convert.web.app/images/airport.png" alt="Drop Zone" />
      </qti-position-object-interaction>
    </qti-position-object-stage>`
};
