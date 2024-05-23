export interface IMSpci<ConfigProperties> {
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
  getInstance: (dom: HTMLElement, configuration: Configuration<ConfigProperties>, state: string) => void;

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
  onready: (pci: IMSpci<T>, state?: string) => void;
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

export declare type QtiVariableJSON = {
  [K in 'list' | 'base']?: {
    [Ka in 'boolean' | 'integer' | 'float' | 'string' | 'pair' | 'directedPair' | 'identifier']?: ResponseType;
  };
};

export interface ModuleResolutionConfig {
  waitSeconds?: number;
  context?: string;
  catchError?: boolean;
  paths: {
    [key: string]: string;
  };
}
