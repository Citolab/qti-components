export interface PciReadyPayload {
  responseIdentifier: string; // The response identifier of the PCI
  status: 'interacting' | 'suspended' | 'closed' | 'solution' | 'review'; // Current status
}

export interface PciDonePayload {
  responseIdentifier: string; // The response identifier of the PCI
  status: 'interacting' | 'suspended' | 'closed' | 'solution' | 'review'; // The final status after completion
  outcome?: unknown; // Optional outcome data (e.g., score, correctness)
}

// Define the ConfigProperties interface
export interface ConfigProperties<T> {
  properties: T; // Follows dataset conversion rules (camelCased keys)
  templateVariables: Record<string, unknown>; // Follows structure in Appendix C
  contextVariables: Record<string, unknown>; // Follows structure in Appendix C
  boundTo: unknown; // Follows structure in Appendix C
  responseIdentifier: string; // Unique within interaction scope

  onready: (payload: PciReadyPayload) => void; // Callback for when PCI is fully constructed and ready
  ondone?: (payload: PciDonePayload) => void; // Optional callback when candidate finishes interaction

  status?: 'interacting' | 'suspended' | 'closed' | 'solution' | 'review'; // Optional, defaults to "interacting"
}

export interface IMSpci<T> {
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
   */
  getState: () => string;
  oncompleted?: () => void;
  destroy?: () => void; // Not used in IMS and not in TAO implementation, so not used here (optional)
}

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

// File type representation
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

// Union of all possible response types for base and list
export type ResponseType =
  | boolean
  | number
  | string
  | QtiBasePair
  | QtiBasePoint
  | QtiFileData
  | Array<boolean | number | string | QtiBasePair | QtiBasePoint | QtiFileData>;

// Record item type
export type QtiRecordItem = {
  name: string;
  base?: QtiBaseTypeJSON | null;
  list?: QtiListTypeJSON | null;
};
export type ResponseVariableType = QtiVariableJSON;
// Base type JSON representation
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

// List type JSON representation
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

// Complete QTI Variable JSON type
export declare type QtiVariableJSON = {
  base?: QtiBaseTypeJSON;
  list?: QtiListTypeJSON;
  record?: QtiRecordItem[] | null;
};

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
