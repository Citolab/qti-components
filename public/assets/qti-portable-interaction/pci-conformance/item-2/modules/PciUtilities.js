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

define([],function() {

  /**
   * Collection of Helper Utilities to perform consistency checks
   * and diagnostics on PCI configurations.
   */
  class PciUtilities {

    constructor () {
    }

    printConfig(config) {
      console.log('config:', JSON.stringify(config))
    }

    isConfigurationConsistent (config) {
      if (typeof config === 'undefined') {
        console.log('[Error] configuration is undefined')
        return false
      }
      if (!this.isObject(config)) {
        console.log('[Error] configuration must be an Object')
        return false
      }
      if (!config.hasOwnProperty('contextVariables')) {
        console.log('[Error] missing contextVariables')
        return false
      }
      if (!this.isObject(config.contextVariables)) {
        console.log('[Error] contextVariables must be an Object')
        return false
      }
      if (!config.hasOwnProperty('templateVariables')) {
        console.log('[Error] missing templateVariables')
        return false
      }
      if (!this.isObject(config.templateVariables)) {
        console.log('[Error] templateVariables must be an Object')
        return false
      }
      if (!config.hasOwnProperty('properties')) {
        console.log('[Error] missing properties')
        return false
      }
      if (!this.isObject(config.properties)) {
        console.log('[Error] properties must be an Object')
        return false
      }
      if (config.hasOwnProperty('pnp') && !this.isObject(config.pnp)) {
        console.log('[Error] pnp must be an Object')
        return false
      }
      if (!config.hasOwnProperty('responseIdentifier')) {
        console.log('[Error] missing responseIdentifier')
        return false
      }
      if (!this.isString(config.responseIdentifier)) {
        console.log('[Error] responseIdentifier must be a String')
        return false
      }
      if (!config.hasOwnProperty('boundTo')) {
        console.log('[Error] missing boundTo')
        return false
      }
      if (config.hasOwnProperty('status') && !this.checkStatus(config.status)) {
        return false
      }
      if (!config.hasOwnProperty('onready')) {
        console.log('[Error] missing onready callback function')
        return false
      }
      if (!this.isFunction(config.onready)) {
        console.log('[Error] onready must be a Function')
        return false
      }
      if (config.hasOwnProperty('ondone') && !this.isFunction(config.ondone)) {
        console.log('[Error] ondone must be a Function')
        return false
      }
      return true
    }

    checkEngineEnvironment () {
      const el = document.querySelector('.stimulus')
      return (el === null)
    }

    checkStatus (status) {
      if (!this.isString(status)) {
        console.log('[Error] status must be a String')
        return false
      }
      switch (status) {
        case 'interacting':
        case 'suspended':
        case 'closed':
        case 'solution':
        case 'review':
          return true
        default:
          console.log(`[Error] status has an impermissible value: ${status}`)
      }
      return false
    }

    checkSecondaryFixedPoints (sfp) {
      // Should be an Object
      if (!this.isObject(sfp)) {
        console.log('[Engine ERROR] SECONDARY-FIXED-POINTS must be an Object')
        return null
      }
      // Should have a list property because it is declared as multiple cardinality
      if (!sfp.hasOwnProperty('list')) {
        console.log('[Engine ERROR] SECONDARY-FIXED-POINTS must be multiple cardinality list')
        return null
      }
      // list property Should be an Object
      if (!this.isObject(sfp.list)) {
        console.log('[Engine ERROR] SECONDARY-FIXED-POINTS list property must be an Object')
        return null
      }
      if (!sfp.list.hasOwnProperty('string')) return
      if (!Array.isArray(sfp.list.string)) {
        console.log('[Engine ERROR] SECONDARY-FIXED-POINTS list must be an Array when not Null')
        return null
      }

      let isError = false
      const points = []
      sfp.list.string.forEach(point => {
        try {
          const obj = JSON.parse(point)
          if (!obj.hasOwnProperty('x')) throw new Error('Point is missing "x" property')
          if (!obj.hasOwnProperty('y')) throw new Error('Point is missing "y" property')
          if (!obj.hasOwnProperty('label')) throw new Error('Point is missing "label" property')
          points.push(obj)
        } catch (error) {
          console.error("Error parsing SECONDARY-FIXED-POINTS JSON:", error.message)
          isError = true
        }
      })

      if (isError) return null
      return { points: points }
    }

    isFunction (value) {
      return (typeof value === 'function')
    }

    isObject (value) {
      return Object.prototype.toString.call(value) === '[object Object]'
    }

    isString (value) {
      return (typeof value === 'string')
    }

  }

  return PciUtilities
});