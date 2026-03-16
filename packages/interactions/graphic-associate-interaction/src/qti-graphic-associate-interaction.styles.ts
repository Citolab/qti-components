import { css } from 'lit';

export default css`
  slot:not([name='prompt']) {
    // position: relative; /* qti-hotspot-choice relative to the slot */
    display: block;
    width: fit-content; /* hotspots not stretching further if image is at max size */
  }
  ::slotted(img) {
    /* image not selectable anymore */
    pointer-events: none;
    user-select: none;
  }
  ::slotted(qti-associable-hotspot) {
    transform: translate(-50%, -50%);
  }
  line-container {
    display: block;
    position: relative;
    width: fit-content;
  }
  svg {
    position: absolute;
    top: 0px;
    left: 0px;
  }
`;
