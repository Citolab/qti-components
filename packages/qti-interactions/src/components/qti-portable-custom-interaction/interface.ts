/**
 * Shared status values for PCI lifecycle callbacks.
 *
 * Matches the status vocabulary used in IMS QTI 3 PCI documentation.
 */
export type PciInteractionStatus = 'interacting' | 'suspended' | 'closed' | 'solution' | 'review';

/**
 * Payload passed to `onready` once a PCI reports it is ready.
 */
export interface PciReadyPayload {
  responseIdentifier: string; // The response identifier of the PCI
  status: PciInteractionStatus; // Current status
}

/**
 * Payload that may be passed to `ondone` when PCI finishes candidate interaction.
 */
export interface PciDonePayload {
  responseIdentifier: string; // The response identifier of the PCI
  status: PciInteractionStatus; // The final status after completion
  outcome?: unknown; // Optional outcome data (e.g., score, correctness)
}

/**
 * Configuration object shape exposed to a PCI instance.
 *
 * Notes for authors:
 * - `properties` contains `data-*` attributes from the host element using dataset rules.
 * - `templateVariables`, `contextVariables`, and `boundTo` follow QTI Appendix-C style JSON values.
 * - `onready` must be called by the PCI once it is interactive.
 * - `ondone` is optional and may be used for explicit completion workflows.
 */
export interface ConfigProperties<T> {
  properties: T; // Follows dataset conversion rules (camelCased keys)
  templateVariables: Record<string, unknown>; // Follows structure in Appendix C
  contextVariables: Record<string, unknown>; // Follows structure in Appendix C
  boundTo: unknown; // Follows structure in Appendix C
  responseIdentifier: string; // Unique within interaction scope

  onready: (payload: PciReadyPayload) => void; // Callback for when PCI is fully constructed and ready
  ondone?: (payload: PciDonePayload) => void; // Optional callback when candidate finishes interaction

  status?: PciInteractionStatus; // Optional, defaults to "interacting"
}

/**
 * IMS-style PCI factory and instance contract.
 *
 * A PCI module registers an object with a `typeIdentifier` and a `getInstance(...)` factory method.
 * The returned PCI instance should implement response/state read/write methods.
 */
export interface IMSpci<T> {
  /**
   * Stable PCI type key, expected to match `custom-interaction-type-identifier`.
   */
  typeIdentifier: string;

  /** @access public
   *  @method getInstance Create a new instance of this portable custom interaction
   *  Will be called by the qtiCustomInteractionContext
   *  @param {DOM Element} dom - the DOM Element this PCI is being added to
   *  @param {Object} configuration - the configuration to apply to this PCI
   *  @param {String} state - a previous saved state to apply to this instance.
   *  This must have been obtained from a prior call to getState on an
   *  instance of this type (same typeIdentifier)
   */
  getInstance: (dom: HTMLElement, configuration: Configuration<T>, state: string) => void;

  /** @access public
   * @method getResponse
   * @return {Object} - the value to assign to the bound QTI response variable
   */
  getResponse: () => QtiVariableJSON | undefined;

  /** @access public
   * @method setResponse
   * @param {Object} value - the value to assign to the bound QTI response variable
   * NOTE: This is not an official QTI method, so no guarantee it is implemented
   * in all PCIs.
   */
  setResponse: (value: QtiVariableJSON) => void;

  /** @access public
   * @method getState
   * @return {String} The current state of this PCI. May be passed to
   * getInstance to later restore this PCI instance.
   * FIXME: host runtime can round-trip object states via prefixed JSON strings;
   * this type remains `string` for IMS compatibility.
   */
  getState: () => string;

  /** @access public
   * @method setState
   * @param {String} value - a state previously obtained from getState
   * to restore this PCI instance to a prior state.
   * FIXME: runtime may deserialize prefixed JSON state before applying it.
   */
  setState(value: string): unknown;

  /**
   * Optional teardown callback. If present, host may call before unload/cleanup.
   */
  oncompleted?: () => void;

  /**
   * Non-standard optional destroy hook; included for compatibility with legacy engines.
   */
  destroy?: () => void; // Not used in IMS and not in TAO implementation, so not used here (optional)
}

/**
 * Bridge callback signature used by this codebase for PCI registration.
 *
 * IMPORTANT:
 * - This type is intentionally minimal for existing call sites.
 * - Runtime initialization payload in `qti-portable-custom-interaction.ts` contains
 *   additional fields (`boundTo`, `templateVariables`, `contextVariables`, etc.).
 * FIXME: align this type with runtime payload to remove ambiguity in generated docs.
 */
export declare type Configuration<T> = {
  onready: (pci: IMSpci<ConfigProperties<T>>, state?: string) => void;
  properties: T;
  // PK: following this: https://www.imsglobal.org/spec/qti/v3p0/impl#h.1mc9puik2ft6
  // All below are not used in the IMS Reference implementation, keeping for ref
  /*    
  ondone: (pci: IMSPci<T>,response:any,state:string, status?: "interacting" | "closed" | "solution" | "review" ) => void;
  status: string;
  templateVariables: any;  
  boundTo: any;
  contextVariables
  responseIdentifier
  */
};

/**
 * QTI base-type `file` representation.
 */
export type QtiFileData = {
  data: string;
  mime: string;
  name?: string;
};

export type QtiBaseBoolean = boolean;
export type QtiBaseInteger = number;
export type QtiBaseFloat = number;
export type QtiBaseString = string;
export type QtiBasePoint = [number, number];
export type QtiBasePair = [string, string];
export type QtiBaseDirectedPair = [string, string];
export type QtiBaseDuration = string; // ISO 8601 duration format
export type QtiBaseFile = QtiFileData;
export type QtiBaseUri = string;
export type QtiBaseIntOrIdentifier = number | string;
export type QtiBaseIdentifier = string;

/**
 * Convenience union for primitive response values used by this implementation.
 */
export type ResponseType =
  | boolean
  | number
  | string
  | QtiBasePair
  | QtiBasePoint
  | QtiFileData
  | Array<boolean | number | string | QtiBasePair | QtiBasePoint | QtiFileData>;

/**
 * A QTI record entry for `record` cardinality values.
 */
export type QtiRecordItem = {
  name: string;
  base?: QtiBaseTypeJSON | null;
  list?: QtiListTypeJSON | null;
};
export type ResponseVariableType = QtiVariableJSON;

/**
 * QTI Appendix-C style JSON representation for base cardinality.
 */
export type QtiBaseTypeJSON = {
  boolean?: QtiBaseBoolean;
  integer?: QtiBaseInteger;
  float?: QtiBaseFloat;
  string?: QtiBaseString;
  point?: QtiBasePoint;
  pair?: QtiBasePair;
  directedPair?: QtiBaseDirectedPair;
  duration?: QtiBaseDuration;
  file?: QtiBaseFile;
  uri?: QtiBaseUri;
  intOrIdentifier?: QtiBaseIntOrIdentifier;
  identifier?: QtiBaseIdentifier;
} | null;

/**
 * QTI Appendix-C style JSON representation for list cardinality.
 */
export type QtiListTypeJSON = {
  boolean?: QtiBaseBoolean[];
  integer?: QtiBaseInteger[];
  float?: QtiBaseFloat[];
  string?: QtiBaseString[];
  point?: QtiBasePoint[];
  pair?: QtiBasePair[];
  directedPair?: QtiBaseDirectedPair[];
  duration?: QtiBaseDuration[];
  file?: QtiBaseFile[];
  uri?: QtiBaseUri[];
  intOrIdentifier?: QtiBaseIntOrIdentifier[];
  identifier?: QtiBaseIdentifier[];
} | null;

/**
 * Complete QTI variable JSON envelope used by PCI bridge messaging.
 */
export declare type QtiVariableJSON = {
  base?: QtiBaseTypeJSON;
  list?: QtiListTypeJSON;
  record?: QtiRecordItem[] | null;
};

/**
 * RequireJS module resolution config accepted by helper utilities and stories.
 */
export interface ModuleResolutionConfig {
  waitSeconds?: number;
  context?: string;
  catchError?: boolean;
  paths: {
    [key: string]: string | string[];
  };
  shim?: {
    [key: string]: {
      deps?: string[]; // Array of dependencies
      exports?: string; // The global variable to use as the module's value
    };
  };
}
