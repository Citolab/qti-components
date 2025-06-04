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

define(['CoordinatePlaneFactory','Graph'], function(CoordinatePlaneFactory, Graph) {

  class GraphingModule {

    constructor (properties, colorTheme, chrome, isDisabled) {
      this.setColorTheme(colorTheme)
      this.setChrome(chrome)
      this.properties = this.transformProperties(properties)
      this.coordinatePlane = null
      this.graph = null
      this.setContainerElement(document.getElementById(this.properties.id))
      this.setIsDisabled(isDisabled)
    }

    transformProperties(props) {
      let p = {
        id: props.id,
        title: props.title,
        program: props.program,
        graphtype: props.graphtype,
        planetype: this.computeCoordinatePlaneType(props.planetype),
        width: this.stringPropToNumber(props.width),
        height: this.stringPropToNumber(props.height),
        vlines: this.stringPropToNumber(props.vlines),
        hlines: this.stringPropToNumber(props.hlines),
        borderlinewidth: this.stringPropToNumber(props.borderlinewidth),
        axislinewidth: this.stringPropToNumber(props.axislinewidth),
        steplinewidth: this.stringPropToNumber(props.steplinewidth),
        maxPoints: this.coerceMaxPoints(this.stringPropToNumber(props.maxpoints)),
        minPoints: this.stringPropToNumber(props.minpoints),
        lineStrokeWidth: this.coerceLineStrokeWidth(this.stringPropToNumber(props.linestrokewidth))
      }
      p = this.stringPropsToJson(p, props, ['xaxis','yaxis','fixedpoints'])

      // Add any Secondary Fixed Points (from Template Variable)
      this.processSecondaryFixedPoints(p, props.secondaryfp)
      // Override invalid response message (if any)
      this.processInvalidResponseMessage(props)

      // Override axis and border widths
      if (this.getChrome() === 'CONFORMANCE') {
        p.axislinewidth = 2
        p.borderlinewidth = 1
      }

      return p
    }

    initialize (state) {
      if (this.getContainerElement() === null) return null

      const palette = this.computeColorPalette()
      this.properties.colorPalette = palette

      // Construct a coordinate plane
      const CPF = new CoordinatePlaneFactory(this.properties)
      const coordinatePlane = CPF.initialize()

      if (coordinatePlane === null) return null

      this.setCoordinatePlane(coordinatePlane)
      this.setForegroundBackground(palette)

      // Construct the Graph with the CoordinatePlane
      this.setGraph(
          new Graph(
            this.properties,
            this.getContainerElement(),
            this.getCoordinatePlane(),
            this.getIsDisabled(),
            state))

      return this.getGraph()
    }

    redraw (colorTheme, isDisabled) {
      this.setColorTheme(colorTheme)
      this.setIsDisabled(isDisabled)

      const palette = this.computeColorPalette()

      this.setForegroundBackground(palette)
      this.getCoordinatePlane().updateRenderingProperties(palette)
      this.getGraph().updateRenderingProperties(palette)
      this.getGraph().toggleDisable(isDisabled)
    }

    getState () {
      return this.getGraph().getState()
    }

    setState (state) {
      this.getGraph().setState(state)
    }

    getCoordinatePlane () {
      return this.coordinatePlane
    }

    setCoordinatePlane (coordinatePlane) {
      this.coordinatePlane = coordinatePlane
    }

    getContainerElement () {
      return this.containerElement
    }

    setContainerElement (containerElement) {
      this.containerElement = containerElement
    }

    getGraph () {
      return this.graph
    }

    setGraph (graph) {
      this.graph = graph
    }

    getStatus () {
      return this.status
    }

    setStatus (status) {
      this.status = status
    }

    getColorTheme () {
      return this.colorTheme
    }

    setColorTheme (colorTheme) {
      this.colorTheme = colorTheme
    }

    setForegroundBackground (palette) {
      const containerElement = this.getContainerElement()
      containerElement.style['color'] = palette.foreground
      containerElement.style['background-color'] = palette.background
    }

    getChrome () {
      return this.chrome
    }

    setChrome (chrome) {
      this.chrome = chrome
    }

    getIsDisabled () {
      return this.isDisabled
    }

    setIsDisabled (isDisabled) {
      this.isDisabled = isDisabled
    }

    getIsValid () {
      return this.getGraph().getIsValid()
    }

    getInvalidResponseMessage () {
      return this.invalidResponseMessage
    }

    setInvalidResponseMessage (message) {
      this.invalidResponseMessage = message
    }

    destroy () {
      this.getGraph().destroy()
    }

    computeCoordinatePlaneType (planeType) {
      if (typeof planeType === 'undefined') return 'full'
      if (planeType === 'default') return 'full'
      return planeType
    }

    stringPropToNumber (property) {
      if (typeof property === 'undefined') return undefined
      if (typeof property !== 'string') return property
      return parseInt(property,10)
    }

    stringPropToBoolean (property) {
      if (typeof property === 'undefined') return undefined
      if (typeof property !== 'string') return property
      return property === 'true'
    }

    stringPropsToJson (p, properties, propertyList) {
      if (propertyList === null) return

      propertyList.forEach(property => {
        if (properties.hasOwnProperty(property)) {
          p[property] = this.parseJsonProp(properties[property])
        }
      })

      return p
    }

    parseJsonProp (propertyString) {
      return JSON.parse(propertyString)
    }

    coerceMaxPoints (maxPoints) {
      if (this.graphtype === 'line') return 2
      return maxPoints
    }

    coerceLineStrokeWidth (lineStrokeWidth) {
      if (typeof lineStrokeWidth === 'undefined') return 6
      return lineStrokeWidth
    }

    processSecondaryFixedPoints (p, sfp) {
      if (typeof sfp === 'undefined') return
      if (!p.hasOwnProperty('fixedpoints')) {
        // secondary becomes the new fixedpoints
        p.fixedpoints = sfp
        return
      }
      // Add sfp's to p.fixedpoints
      sfp.points.forEach(point => {
        p.fixedpoints.points.push(point)
      })
    }

    processInvalidResponseMessage (p) {
      const message =
        p.hasOwnProperty('invalidresponsemessage')
          ? p.invalidresponsemessage
          : ''
      this.setInvalidResponseMessage(message)
    }

    computeColorPalette () {
      let fg = '#212529'
      let bg = '#fff'
      let p = '#da70d6'
      let fp = '#009688'
      let a = '#f06'
      let b = '#00f'

      // There are 14 enumerated color themes
      switch (this.getColorTheme()) {
        case 'default':
          if (this.getChrome() === 'CONFORMANCE') {
            a = b  // override axis color
            b = fg // override border color
          }
          break

        case 'default-reverse':
          fg = '#fff'
          bg = '#212529'
          p = '#dd92f6' // neon pink
          fp = '#7efdd0' // neon green
          b = fg
          break

        case 'high-contrast':
          fg = '#000'
          bg = '#fff'
          a = b = fg
          break

        case 'high-contrast-reverse':
          fg = '#fff'
          bg = '#000'
          p = '#dd92f6' // neon pink
          fp = '#7efdd0' // neon green
          a = b = fg
          break

        case 'yellow-blue':
          fg = '#ffcc00' // yellow
          bg = '#003398' // blue
          fp = '#bbcef1'
          p = '#ffbb00'
          a = b = fg
          break

        case 'blue-yellow':
          fg = '#003398' // blue
          bg = '#ffcc00' // yellow
          p = '#0d6efd'
          a = b = fg
          break

        case 'black-rose':
          p = '#2871bd'
          fg = '#000'
          bg = '#ffd0ff'  // rose
          a = b = fg
          break

        case 'rose-black':
          fg = '#ffd0ff' // rose
          bg = '#000'
          p = '#99A7ff'  // pale blue
          a = b = fg
          break

        case 'black-cream':
          fg = '#000'
          bg = '#fffacd' // lchiffon
          a = b = fg
          break

        case 'cream-black':
          fg = '#fffacd' // lchiffon
          bg = '#000'
          a = b = fg
          break

        case 'medgray-darkgray':
          fg = '#e5e5e5' // mgray
          bg = '#666' // dgray
          fp = '#c8c8c8'
          a = b = fg
          break

        case 'darkgray-medgray':
          fg = '#666' // dgray
          bg = '#e5e5e5' // mgray
          a = b = fg
          break

        case 'black-cyan':
          fg = '#000'
          bg = '#add8e6'  // lblue
          a = fg
          b = fg
          break

        case 'cyan-black':
          fg = '#add8e6' // lblue
          bg = '#000'
          p = '#dd92f6' // neon pink
          fp = '#7efdd0' // neon green
          a = b = fg
          break

        default:
          // return the 'default' theme if we don't recognize the theme
      }

      return {
        foreground: fg,
        background: bg,
        point: p,
        fixedpoint: fp,
        acolor: a,
        bcolor: b
      }
    }
  }

  return GraphingModule
});