import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    :host {
      display: block;
      --qti-select-point-marker-size: 1.5rem;
      /* Where the marker's shape points: -100% stands it on the point by its bottom (a pin's tip),
         -50% centres it (a ring, a star). A theme that changes the shape sets --qc-marker-anchor. */
      --qti-select-point-marker-anchor: var(--qc-marker-anchor, var(--cito-marker-anchor, -100%));
      /* The marker's shape: a pin by default, or the theme's --qc-icon-marker (a mask). */
      --qti-select-point-icon: var(
        --qc-icon-marker,
        var(
          --cito-icon-marker,
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'%3E%3Cpath d='M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z'/%3E%3C/svg%3E")
        )
      );
    }
    point-container {
      display: block;
      position: relative;
      width: fit-content;
    }

    ::slotted(img) {
      max-width: 100%;
      height: auto;
      display: block;
    }

    [part~='point'] {
      transform: translate(-50%, var(--qti-select-point-marker-anchor));
      width: var(--qti-select-point-marker-size);
      height: var(--qti-select-point-marker-size);
      min-width: var(--qti-select-point-marker-size);
      min-height: var(--qti-select-point-marker-size);
      padding: 0;
      margin: 0;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;

      /*
       * A halo round the marker, so it stands out on any picture: white round a dark marker, black
       * round a light one. Derived from the marker colour by its lightness (relative colour
       * syntax), so setting one colour sets both; --qti-select-point-halo overrides it.
       *
       * The halo is two drop-shadows on this element, which hug the shape drawn by ::before. It
       * cannot sit on the masked shape itself: a mask clips its own element's filter away.
       */
      --qti-select-point-halo-auto: oklch(
        from var(--qti-select-point-marker-color, currentColor) clamp(0, (0.7 - l) * 1000, 1) 0 0
      );
      filter: drop-shadow(0 0 1px var(--qti-select-point-halo, var(--qti-select-point-halo-auto)))
        drop-shadow(0 0 1px var(--qti-select-point-halo, var(--qti-select-point-halo-auto)));
    }

    [part~='point']::before {
      content: '';
      position: absolute;
      inset: 0;
      background-color: var(--qti-select-point-marker-color, currentColor);
      -webkit-mask: var(--qti-select-point-icon) no-repeat center / contain;
      mask: var(--qti-select-point-icon) no-repeat center / contain;
    }
  `
];
