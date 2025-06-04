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

define(['raphael','FullPlane'], function(Raphael, FullPlane) {

  class CoordinatePlaneFactory {

    constructor (config) {
      const padding = this.computeAreaPadding(config)

      this.planeConfiguration = {
        planeType: config.planetype,
        axislinewidth: config.axislinewidth,
        borderlinewidth: config.borderlinewidth,
        steplinewidth: config.steplinewidth,
        xLabelPrecision: config.xaxis.labelprecision,
        yLabelPrecision: config.yaxis.labelprecision,
        xPrecision: config.xaxis.precision,
        yPrecision: config.yaxis.precision,
        xaxisLabel: config.xaxis.label,
        yaxisLabel: config.yaxis.label,
        xstep: config.xaxis.step,
        ystep: config.yaxis.step,
        xsubsteps: config.xaxis.substeps,
        ysubsteps: config.yaxis.substeps,
        vlines: config.vlines,
        hlines: config.hlines,
        xstartvalue: 0,
        ystartvalue: 0,
        padding: padding,
        colorPalette: config.colorPalette,
        area: { x: padding, y: padding, width: config.width - padding, height: config.height - padding}
      }

      this.setPaper(
          this.createPaper(
            config.id,
            config.width + padding,
            config.height + padding))

      this.setCoordinatePlane(
          this.createCoordinatePlane(
             this.getPaper(),
             this.planeConfiguration))
    }

    initialize () {
      const coordinatePlane = this.getCoordinatePlane()
      if (coordinatePlane === null) return null

      coordinatePlane.render()

      return coordinatePlane
    }

    getCoordinatePlane () {
      return this.coordinatePlane
    }

    setCoordinatePlane (coordinatePlane) {
      this.coordinatePlane = coordinatePlane
    }

    getPaper () {
      return this.paper
    }

    setPaper (paper) {
      this.paper = paper
    }

    computeAreaPadding (config) {
      const p = 30
      const minp = (50 - (config.pointradius * 2))
      if (p < minp) return minp
      return p
    }

    createCoordinatePlane (paper, config) {
      if ((paper === null) || (config === null)) return null

      switch (config.planeType) {
        case 'full':
          return new FullPlane(paper, config)

        default:
          return null
      }
    }

    createPaper (element, width, height) {
      const paper = Raphael(element, width, height)
      paper.canvas.setAttribute('class', 'unselectable')
      paper.canvas.style.touchAction = 'manipulation'
      return paper
    }

 }

 return CoordinatePlaneFactory
});
