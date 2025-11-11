import { css } from 'lit';
// import componentStyles from '../../utilities/styles/component.styles';
// :host {
//   display: inline-block;
//   position: relative;
// }
/* ${componentStyles} */
export default css`
  :host {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  :host(.qti-choices-top) {
    flex-direction: column;
  }
  :host(.qti-choices-bottom) {
    flex-direction: column-reverse;
  }
  :host(.qti-choices-left) {
    flex-direction: row;
  }
  :host(.qti-choices-right) {
    flex-direction: row-reverse;
  }
  /* [part='drops'] , */
  [name='prompt'] {
    width: 100%;
  }
  [name='drags'] {
    display: flex;
    align-items: flex-start;
    flex: 1;
    border: 2px solid transparent;
    padding: 0.3rem;
    border-radius: 0.3rem;
    gap: 0.5rem;
  }
`;
