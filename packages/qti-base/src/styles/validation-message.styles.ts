import { css } from 'lit';

/**
 * The `#validation-message` region every interaction renders, hidden until there is a message.
 *
 * `Interaction` owns showing and hiding it: `reportValidity` sets
 * `display: block !important` inline when `_internals.validationMessage` is non-empty, and clears the
 * text and sets `display: none` inline again when it is not (see interaction.ts). An inline
 * `!important` beats this rule, so the JS still wins whenever it speaks.
 *
 * What it did not own was the *initial* state. Before first validation the div has no inline style,
 * so it needs a stylesheet to start hidden — otherwise it paints as an empty box with the theme's
 * warning border and padding. That hide used to be a `display: none` inside the theme's
 * `validation-message` mixin, which made a document stylesheet responsible for a shadow node's box.
 * Two components had already noticed and worked around it with `style="display:none"` in their
 * template; the other five relied on the theme.
 *
 * The theme still paints the message — colour, border, padding, radius — via `::part(message)`.
 */
export const validationMessage = css`
  [part~='message'] {
    display: none;
  }
`;
