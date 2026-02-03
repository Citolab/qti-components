import { nothing } from 'lit/html.js';
import { directive } from 'lit/directive.js';
import { AsyncDirective } from 'lit/async-directive.js';

import type { ElementPart, Part } from 'lit';

/**
 * A directive that spreads arguments to HTML attributes with intelligent filtering.
 *
 * Features:
 * - Includes `max-choices="0"` even though 0 is falsy
 * - Excludes boolean attributes with no value, empty string, null, or undefined
 * - Excludes event handlers and functions
 *
 * Based on the @open-wc/lit-helpers spread directive implementation.
 */
export class SpreadArgsDirective extends AsyncDirective {
  host!: EventTarget | object | Element;
  element!: Element;
  prevData: { [key: string]: unknown } = {};

  render(_spreadData: { [key: string]: unknown }) {
    return nothing;
  }

  update(part: Part, [spreadData]: Parameters<this['render']>) {
    if (this.element !== (part as ElementPart).element) {
      this.element = (part as ElementPart).element;
    }
    this.host = part.options?.host || this.element;
    this.apply(spreadData);
    this.groom(spreadData);
    this.prevData = { ...spreadData };
    return nothing;
  }

  apply(data: { [key: string]: unknown }) {
    // Filter the data according to our rules
    const filteredData = this.filterArgs(data);

    const { prevData, element } = this;
    for (const key in filteredData) {
      const value = filteredData[key];
      if (value === prevData[key]) {
        continue;
      }

      // Handle different attribute types
      if (value === true) {
        // Boolean attribute - just set the attribute name
        element.setAttribute(key, '');
      } else if (value === false) {
        // Remove false boolean attributes
        element.removeAttribute(key);
      } else if (value != null) {
        // Standard attribute with value
        element.setAttribute(key, String(value));
      } else {
        // Remove null/undefined attributes
        element.removeAttribute(key);
      }
    }
  }

  groom(data: { [key: string]: unknown }) {
    const { prevData, element } = this;
    if (!prevData) return;

    // Filter the current data to see what we should have
    const filteredData = data ? this.filterArgs(data) : {};

    for (const key in prevData) {
      if (!filteredData || !(key in filteredData)) {
        // Remove attributes that are no longer present in filtered data
        element.removeAttribute(key);
      }
    }
  }

  private filterArgs(args: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(args).filter(([key, value]) => {
        // Always exclude functions (events/functions)
        if (typeof value === 'function') {
          return false;
        }

        // Special case for max-choices: include when value is 0
        if (key === 'max-choices' && value === 0) {
          return true;
        }

        // Exclude empty strings, null, and undefined
        if (value === '' || value === null || value === undefined) {
          return false;
        }

        // Include all other truthy values
        return true;
      })
    );
  }
}

/**
 * A directive that spreads arguments to HTML attributes with intelligent filtering.
 *
 * @param args - Object containing key-value pairs to spread as attributes
 *
 * @example
 * ```typescript
 * import { spreadArgs } from '@qti-lib/lit-utilities';
 *
 * const args = {
 *   'max-choices': 0,     // Will be included
 *   disabled: true,       // Will be included as disabled=""
 *   hidden: false,        // Will be excluded
 *   title: '',            // Will be excluded
 *   onClick: () => {},    // Will be excluded
 *   id: 'my-element'      // Will be included as id="my-element"
 * };
 *
 * html`<my-element ${spreadArgs(args)}></my-element>`;
 * ```
 */
export const spreadArgs = directive(SpreadArgsDirective);

/**
 * Helper function version that works with @open-wc/lit-helpers spread directive.
 * @deprecated Use the spreadArgs directive directly instead.
 */
export function filterArgsForSpread(args: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(args).filter(([, value]) => {
      if (typeof value === 'function') return false;
      if (value === '' || value === null || value === undefined) return false;
      return true;
    })
  );
}
