import { css } from 'lit';
// import componentStyles from '../../utilities/styles/component.styles';

/* ${componentStyles} */
export default css`
  :host {
    display: block;
    width: 100%;
    min-height: 50px;
  }

  ::slotted(qti-interaction-markup) {
    display: none;
  }
`;
