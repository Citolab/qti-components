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
  getResponse: () => QtiVariableJSON;

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

export declare type ResponseType =
  | boolean
  | number
  | string
  | [number, number]
  | [string, string]
  | string[]
  | [number | string][];

export declare type ResponseVariableType = {
  string?: ResponseType;
  boolean?: ResponseType;
  integer?: ResponseType;
  float?: ResponseType;
  pair?: ResponseType;
  directedPair?: ResponseType;
  identifier?: ResponseType;
};

export declare type QtiVariableJSON = {
  [K in 'list' | 'base']?: ResponseVariableType;
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
