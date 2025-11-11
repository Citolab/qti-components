import { css } from 'lit';

export default css`
  slot:not([name='prompt']) {
    position: relative; /* qti-hotspot-choice relative to the slot */
    display: inline-block;
    width: fit-content; /* hotspots not stretching further if image is at max size */
    line-height: 0; /* remove gaps below image */
    touch-action: manipulation; /* Prevents double-tap zoom and improves touch responsiveness */
  }
  ::slotted(img) {
    /* image not selectable anymore */
    display: block;
    pointer-events: none;
    user-select: none;
    touch-action: manipulation;
    /* width:100%; */
  }
`;
