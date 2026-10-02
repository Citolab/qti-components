import { css } from 'lit';

export default css`
  :host {
    display: contents;
  }

  ::slotted(qti-catalog-info) {
    display: none;
  }
`;
