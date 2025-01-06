import { css } from 'lit';

export default css`
  slot:not([name='prompt']) {
    position: relative; /* qti-hotspot-choice relative to the slot */
    display: block;
    width: fit-content; /* hotspots not stretching further if image is at max size */
  }
  ::slotted(img) {
    /* image not selectable anymore */
    pointer-events: none;
    user-select: none;
    /* width:100%; */
  }
`;
