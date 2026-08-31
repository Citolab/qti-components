/**
 * Smallest shared contract for any form-associated custom element.
 *
 * Keep this intentionally tiny and platform-aligned. QTI-specific concerns
 * such as response identifiers, readonly handling, and validation
 * should be layered via separate capability interfaces below.
 */
export interface FormAssociatedInteraction extends HTMLElement {
  disabled: boolean;
  readonly internals: ElementInternals;
  formResetCallback(): void;
}

/** QTI response identity capability. */
export interface ResponseIdentifiedInteraction {
  responseIdentifier: string;
}

/** Optional readonly capability used by many QTI interactions. */
export interface ReadonlyInteraction {
  readonly: boolean;
}

/** Optional reset capability beyond the platform form reset callback. */
export interface ResettableInteraction {
  reset(): void;
}

/** Interaction that publishes and stores a response value. */
export interface ResponseInteractionElement extends FormAssociatedInteraction {
  responseIdentifier: string;
  response: string | string[] | null;
  saveResponse(value: string | string[], state?: string | null): void;
}

/** Interaction that participates in validity reporting. */
export interface ValidatableInteraction extends FormAssociatedInteraction {
  validate(): boolean;
  reportValidity(): boolean;
}

/**
 * Common contract expected by item containers when tracking registered interactions.
 */
export interface RegisteredInteraction
  extends ResponseInteractionElement,
    ValidatableInteraction,
    ReadonlyInteraction,
    ResettableInteraction {}

/**
 * @deprecated Prefer `RegisteredInteraction` for new code.
 */
export type IInteraction = RegisteredInteraction;
