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
    flex-direction: column-reverse;
  }
  :host(.qti-choices-bottom) {
    flex-direction: column;
  }
  :host(.qti-choices-left) {
    flex-direction: row-reverse;
    & [name='drags'] {
      width: 25%;
    }
    & [part='image'] {
      width: 75%;
    }
  }
  :host(.qti-choices-right) {
    flex-direction: row;
    & [name='drags'] {
      width: 25%;
    }
    & [part='image'] {
      width: 75%;
    }
  }
  [part='image'] {
    display: block;
    position: relative;
  }
  /* [part='drops'] , */

  [name='drags'] {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    flex: 1;
    border: 2px solid transparent;
    padding: 0.3rem;
    border-radius: 0.3rem;
    gap: 0.5rem;
  }
  ::slotted(img) {
    display: inline-block;
    user-select: none;
    pointer-events: none;
  }
`;
