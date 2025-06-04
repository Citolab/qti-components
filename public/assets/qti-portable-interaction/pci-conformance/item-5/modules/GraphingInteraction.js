/**
 * MIT License
 *
 * Copyright (c) 2025 Amp-up.io, LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";

define(
  ['qtiCustomInteractionContext','PciUtilities','GraphingModule'],
  function (ctx, PciUtilities, GraphingModule) {

  const self = {

    typeIdentifier: 'urn:ampup:pci:2025:graphingInteraction',

    _dom: null,
    _config: {},
    _state: { points: [] },
    _colorTheme: 'default',
    _program: 'default',
    _status: 'interacting',
    _eventListenersInitialized: false,
    _gm: null,
    _utils: null,
    _invalidResponseMessage: '',

    /**
     *  @access public
     *  @method getInstance Create a new instance of this portable custom interaction
     *  Will be called by the qtiCustomInteractionContext
     *  @param {DOM Element} dom - the DOM Element this PCI is being added to
     *  @param {Object} configuration - the configuration to apply to this PCI
     *  @param {Object} state - a previous saved state to apply to this instance.
     *  This must have been obtained from a prior call to getState on an
     *  instance of this type (same typeIdentifier)
     */
    getInstance (dom, config, state) {
      this._dom = dom
      this._config = config

      this._utils = new PciUtilities()

      if (this._utils.checkEngineEnvironment())
        console.log('[Engine SUCCESS][PCI IFramed=TRUE]')
      else
        console.log('[Engine ERROR][PCI IFramed=FALSE]')

      // Consistency check the configuration
      // {
      //   properties: { <all data-<propertyname> attributes> },
      //   templateVariables: {},
      //   contextVariables: {},
      //   pnp: {}, // (optional) pnp
      //   boundTo: {
      //     "base": null
      //   },
      //   responseIdentifier: "RESPONSE",
      //   onready: qtiCustomInteractionContext.notifyReady, // the bridge's onready callback function
      //   ondone: qtiCustomInteractionContext.notifyDone, // (optional) the bridge's ondone callback function
      //   status: "interacting" // (optional) current item lifecycle status
      // }
      if (!this._utils.isConfigurationConsistent(config)) {
        console.log('[Engine ERROR][getInstance][Configuration=Inconsistent]')
        return null
      }

      console.log('[Engine SUCCESS][getInstance][Configuration=Consistent]')

      this._processConfigContextVariables(this._config.contextVariables)
      this._processConfigTemplateVariables(this._config.templateVariables)
      this._processConfigStatus(this._config)
      this._processConfigPnp(this._config)

      if (typeof state !== 'undefined') {
        this._state = state
      }

      this._render(this._config.properties, this._status)
    },

    /**
     * @access public
     * @method getResponse - Should be bound to a multiple cardinality Response Declaration.
     * @return {Object} - the value to assign to the bound QTI response variable
     */
    getResponse () {
      // Retrieve state, then build a proper QTI PCI response from state
      this._state = this._gm.getState()
      if (this._state.points.length === 0) return { list: null }

      const points = []
      this._state.points.forEach((point) => {
        points.push([point.x,point.y])
      })

      return { list: { point: points } }
    },

    /**
     * @access public
     * @method getState
     * @return {Object} The current state of this PCI. May be passed to
     * getInstance to later restore this PCI instance.
     */
    getState () {
      this._state = this._gm.getState()
      return this._state
    },

    /**
     * @access public
     * @method (Optional) oncompleted Will be called by the delivery engine as a signal that this
     * instance is being destroyed via the Communication Bridge.
     * Will be called by the qtiCustomInteractionContext
     *
     * Perform any cleanup (unbind event listeners in the modules).
     */
    oncompleted () {
      this._removeEventListeners()
      this._gm.destroy()
    },

    /**
     * @access public
     * @method (Optional) setRenderingProperties May be called by the delivery engine
     * when there is a change to an item after a getInstance call, but before an oncompleted call.
     * @param {Object} properties
     * {
     *   pnp: {},
     *   status: "item lifecycle status"
     * }
     */
    setRenderingProperties (properties) {
      this._removeDomTheme()
      this._processConfigPnp(properties)
      this._addDomTheme()
      this._status = properties.status
      this._gm.redraw(this._colorTheme, this._isDisabled(this._status))
    },

    /**
     * @access public
     * @method (Optional) checkValidity May be called by the delivery engine
     * to get this interaction's validity
     * @return {Boolean}
     */
    checkValidity () {
      return this._isValid()
    },

    /**
     * @access public
     * @method (Optional) getCustomValidity Return the custom validity message for the PCI.
     * Use the empty string to indicate that the element does not have a custom validity error.
     * @return {String}
     */
    getCustomValidity () {
      this._invalidResponseMessage = this._gm.getInvalidResponseMessage()
      return this._invalidResponseMessage
    },

    //
    // Internal methods
    //

    _render (properties, status) {
      this._addEventListeners()
      this._addDomTheme()
      this._gm = new GraphingModule(
		  properties,
		  this._colorTheme,
		  this._program,
		  this._isDisabled(status))
      this._gm.initialize(this._state)
      this._config.onready(this, this._state)
    },

    _processConfigContextVariables (contextVariables) {
      // We only care about QTI_CONTEXT -> environmentIdentifier
      if (!contextVariables.hasOwnProperty('QTI_CONTEXT')) return

      // Consistency check QTI_CONTEXT and get the environmentIdentifier
      const environmentIdentifier =
        this._consistencyCheckQtiContext(contextVariables['QTI_CONTEXT'])

      // Override the default program if we find CONFORMANCE
      this._program =
        (environmentIdentifier === 'CONFORMANCE')
          ? 'CONFORMANCE'
          : 'default'
    },

    _consistencyCheckQtiContext (qc) {
      if (!qc.hasOwnProperty('record')) {
        console.log('[Engine ERROR] QTI_CONTEXT must be a "record"')
        return null
      }
      if (!Array.isArray(qc.record)) {
        console.log('[Engine ERROR] QTI_CONTEXT.record must be an Array')
        return null
      }

      let hasCandidateIdentifier = false
      let hasTestIdentifier = false
      let hasEnvironmentIdentifier = false
      let environmentIdentifier = null

      qc.record.forEach(recordField => {
        if (!recordField.hasOwnProperty('name')) {
          console.log('[Engine ERROR] QTI_CONTEXT record field must have a "name" property')
          return null
        }
        if (!recordField.hasOwnProperty('base')) {
          console.log('[Engine ERROR] QTI_CONTEXT record field must have a "base" property')
          return null
        }
        if (recordField.name === 'candidateIdentifier') hasCandidateIdentifier = true
        if (recordField.name === 'testIdentifier') hasTestIdentifier = true
        if (recordField.name === 'environmentIdentifier') {
          hasEnvironmentIdentifier = true
          if (recordField.base === null) return
          if (!recordField.base.hasOwnProperty('string')) {
            console.log('[Engine ERROR] QTI_CONTEXT record field "environmentIdentifier" must have a "string" base-type')
            return null
          }
          environmentIdentifier = recordField.base.string
        }
      })

      if (!(hasCandidateIdentifier && hasTestIdentifier && hasEnvironmentIdentifier)) {
        console.log('[Engine ERROR] QTI_CONTEXT record is missing required record fields')
        return null
      }

      return environmentIdentifier
    },

    _processConfigTemplateVariables (templateVariables) {
      // We only care about SECONDARY-FIXED-POINTS
      if (!templateVariables.hasOwnProperty('SECONDARY-FIXED-POINTS')) return

      // "SECONDARY-FIXED-POINTS": {
      //   "list": {
      //     "string": [ "{ \"x\":2, \"y\":2, \"label\":\"T\" }" ]
      //   }
      // }

      const sfp = this._utils.checkSecondaryFixedPoints(templateVariables['SECONDARY-FIXED-POINTS'])
      if (sfp === null) return
      // Patch the sfp list onto properties
      this._config.properties.secondaryfp = sfp
    },

    _processConfigPnp (config) {
      // pnp is optional
      if (!config.hasOwnProperty('pnp')) return
      const pnp = config.pnp
      // Evaluate the PNP for access-for-all-pnp -> text-appearance -> color-theme
      if (!pnp.hasOwnProperty('access-for-all-pnp')) return
      const afapnp = pnp['access-for-all-pnp']
      if (!afapnp.hasOwnProperty('text-appearance')) return
      const ta = afapnp['text-appearance']
      if (!ta.hasOwnProperty('color-theme')) return
      this._colorTheme = this._processColorTheme(ta['color-theme'])
    },

    _processConfigStatus (config) {
      // status is optional.  when undefined, default to 'interacting'
      this._status = (config.hasOwnProperty('status')) ? config.status : 'interacting'
    },

    _processColorTheme (theme) {
      // There are 14 enumerated QTI color themes
      switch (theme) {
        case 'default':
        case 'default-reverse':
        case 'high-contrast':
        case 'high-contrast-reverse':
        case 'yellow-blue':
        case 'blue-yellow':
        case 'black-rose':
        case 'rose-black':
        case 'black-cyan':
        case 'cyan-black':
        case 'black-cream':
        case 'cream-black':
        case 'medgray-darkgray':
        case 'darkgray-medgray':
          return theme
        default:
          // return the 'default' theme if we don't recognize the theme
          return 'default'
      }
    },

    _isDisabled (status) {
      return status !== 'interacting'
    },

    _isValid () {
      return this._gm.getIsValid()
    },

    _addEventListeners () {
      if (!this._initialized) {
        this._initialized = true
        this._dom.addEventListener('graph.change', this._handleGraphChange.bind(this))
      }
    },

    _removeEventListeners () {
      this._dom.removeEventListener('graph.change', this._handleGraphChange)
    },

    _addDomTheme () {
      this._dom.classList.add(`theme-${this._colorTheme}`)
    },

    _removeDomTheme () {
      this._dom.classList.remove(`theme-${this._colorTheme}`)
    },

    _handleGraphChange (event) {
      const detail = {
        interaction: this,
        responseIdentifier: this._config.responseIdentifier,
        valid: this._isValid(),
        value: this.getResponse()
      }

      const e =
          new CustomEvent(
            'qti-interaction-changed',
            { detail: detail, bubbles: true, cancelable: true })

      this._dom.dispatchEvent(e)
    }
  }

  ctx.register(self)
});