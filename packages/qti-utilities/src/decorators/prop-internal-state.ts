import { property } from 'lit/decorators.js';

import type { ReactiveElement } from 'lit';
import type { PropertyDeclaration } from 'lit';

// Extended decorator options
interface InternalStateOptions extends PropertyDeclaration {
  aria?: string; // Corresponding ARIA attribute, e.g., 'aria-disabled'
}

export function propInternalState(options: InternalStateOptions) {
  return (protoOrDescriptor: any, name: string) => {
    // Apply the default Lit `@property` decorator
    property(options)(protoOrDescriptor, name);

    // Intercept the property descriptor to enhance functionality
    const key = `__${name}`; // Internal backing field

    Object.defineProperty(protoOrDescriptor, name, {
      get() {
        return this[key];
      },
      set(value: any) {
        const oldValue = this[key];
        this[key] = value;

        // Trigger updates if value changes
        if (oldValue !== value) {
          // Update internals state
          if (this._internals?.states) {
            const stateName = name.toLowerCase();
            if (value) {
              this._internals.states.add(`--${stateName}`);
            } else {
              this._internals.states.delete(`--${stateName}`);
            }
          }

          // Update ARIA attributes if specified
          if (options.aria && this._internals) {
            const ariaAttribute = options.aria;
            if (value) {
              this._internals[ariaAttribute] = 'true';
            } else {
              this._internals[ariaAttribute] = null;
            }
          }

          // Request an update
          (this as ReactiveElement).requestUpdate(name, oldValue);
        }
      },
      configurable: true,
      enumerable: true
    });
  };
}
