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

define(['bignumber'],function(BigNumber) {

  class FullPlane {

    constructor (paper, config) {
      this.setPaper(paper)
      this.setColorPalette(config.colorPalette)
      this.setBorderWidth(config.borderlinewidth)
      this.setAxisLineWidth(config.axislinewidth)
      this.setStepLineWidth(config.steplinewidth)
      this.setInnerBoundingRect(config.area)
      this.setBoundingRect(config.area)
      this.setShapes([])
      this.width = config.area.width
      this.height = config.area.height
      this.padding = config.padding
      this.planeX = config.area.x + config.borderlinewidth
      this.planeY = config.area.y + config.borderlinewidth
      this.planeWidth = config.area.width - config.borderlinewidth * 2
      this.planeHeight = config.area.height - config.borderlinewidth * 2
      this.cellWidth = this.planeWidth /config.vlines
      this.cellHeight = this.planeHeight / config.hlines
      this.vlines = config.vlines
      this.hlines = config.hlines
      this.xstep = config.xstep
      this.ystep = config.ystep
      this.xsubsteps = config.xsubsteps
      this.ysubsteps = config.ysubsteps
      this.xMax = this.xstep * this.vlines / 2
      this.yMax = this.ystep * this.hlines / 2
      this.xMin = this.xMax * -1
      this.yMin = this.yMax * -1
      this.xaxisLabel = config.xaxisLabel
      this.yaxisLabel = config.yaxisLabel
      this.stepLabelFontSize = this.stepLabelFontSize(),
      this.xLabelPrecision = config.xLabelPrecision,
      this.yLabelPrecision = config.yLabelPrecision,
      this.xPrecision = config.xPrecision
      this.yPrecision = config.yPrecision
      this.computeSnappingMatrix()
    }

    render () {
      this.renderBackground()
      this.renderVerticalStepLines()
      this.renderHorizontalStepLines()
      this.renderAxes()
    }

    renderBackground () {
      const bw = this.getBorderWidth()
      const box = this.getInnerBoundingRect()

      this.border =
        this.paper
          .rect(
            box.x + bw / 2,
            box.y + bw / 2,
            box.width - bw,
            box.height - bw)
          .attr({
            stroke: this.getBorderColor(),
            'stroke-width': bw,
            fill: this.getColorPalette().background
           })

      this.border.node.setAttribute('class', 'plane-outer-border')
      this.addShape(this.border)
    }

    renderAxisLabels () {
      const box = this.getInnerBoundingRect()
      const vcenter = box.height / 2
      const hcenter = box.width / 2
      const padding = 5

      if (this.xaxisLabel != '') {
        this.labelX = this.renderAxisLabel(this.xaxisLabel)
        const labelBox = this.labelX.getBBox()
        this.labelX.transform('t' + (box.x + box.width + labelBox.width/2 + padding) + ',' + (box.y + vcenter))
        this.width = this.width + labelBox.width + padding
        this.getBoundingRect().width = this.width
        this.addShape(this.labelX)
      }

      if (this.yaxisLabel != '') {
        this.labelY = this.renderAxisLabel(this.yaxisLabel)
        const labelBox = this.labelY.getBBox()
        this.labelY.transform('t' + (box.x + hcenter) + ',' + (box.y - labelBox.height/2 - padding))
        this.height = this.height + labelBox.height + padding
        this.getBoundingRect().height = this.height
        this.addShape(this.labelY)
      }
    }

    renderAxisLabel (labelText) {
      const label =
        this.paper
          .text(0, 0, labelText)
          .attr({
            fill: this.getColorPalette().foreground,
            'font-size': 14,
            'font-family': 'Verdana',
            'text-anchor': 'middle'
          })

      return label
    }

    /**
     * @description Render all vertical step lines except for the y axis.
     */
    renderVerticalStepLines () {
      const sy = this.planeY
      const ey = this.planeY + 1 + this.planeHeight
      const xsubsteps = this.xsubsteps

      // Draw a line through two points for each x value
      for (let i=xsubsteps; i<this.vxArray.length-1; i += xsubsteps) {
         if (this.vxArray[i] !== 0) {
           const stepLine =
             this.paper
               .path(this.computeLinePath(this.pxArray[i], sy, this.pxArray[i], ey))
               .attr(this.getStepLineAttributes())
           this.addShape(stepLine)

           const stepLabel = this.renderStepLabel(this.vxArray[i], this.pxArray[i], true)
           this.addShape(stepLabel)
        }
      }
    }

    /**
     * @description Render all horizontal step lines except for the x axis.
     */
    renderHorizontalStepLines () {
      const sx = this.planeX
      const ex = this.planeX + 1 + this.planeWidth
      const ysubsteps = this.ysubsteps

      // Draw a line through two points for each y value
      for (let i=ysubsteps; i<this.vyArray.length - 1; i += ysubsteps) {
        if (this.vyArray[i] !== 0) {
          const stepLine =
            this.paper
              .path(this.computeLinePath(sx, this.pyArray[i], ex, this.pyArray[i]))
              .attr(this.getStepLineAttributes())
          this.addShape(stepLine)

          const stepLabel = this.renderStepLabel(this.vyArray[i], this.pyArray[i], false)
          this.addShape(stepLabel)
        }
      }
    }

    renderAxes () {
      this.renderAxisX()
      this.renderAxisY()
      this.renderNorthArrow()
      this.renderWestArrow()
      this.renderEastArrow()
      this.renderSouthArrow()
      this.renderAxisLabels()
    }

    renderAxisX () {
      // Start at Y(0)
      const box = this.getInnerBoundingRect()
      const x = this.valueYtoPixelY(0)
      const aw = this.getAxisLineWidth()
      const sx = box.x + aw*2
      const sy = x
      const ex = box.x + box.width - aw*4
      const ey = x

      const axis =
        this.paper
          .path(this.computeLinePath(sx, sy, ex, ey))
          .attr({
            stroke: this.getAxisColor(),
            'stroke-width': aw
        })
      axis.node.setAttribute('class', 'x-axis')
      this.addShape(axis)
    }

    renderAxisY () {
      // Start at X(0)
      const box = this.getInnerBoundingRect()
      const y = this.valueXtoPixelX(0)
      const aw = this.getAxisLineWidth()
      const sx = y
      const sy = box.y + aw*4
      const ex = y
      const ey = this.planeY + box.height - (aw * 4)

      const axis =
        this.paper
          .path(this.computeLinePath(sx, sy, ex, ey))
          .attr({
            stroke: this.getAxisColor(),
            'stroke-width': aw
        })
      axis.node.setAttribute('class', 'y-axis')
      this.addShape(axis)
      this.vyArray.reverse()
    }

    renderNorthArrow () {
      const arrowPath =
        this.computeArrowPath(
          this.planeX + this.planeWidth/2,
          this.planeY,
          this.cellWidth * 0.5,
          this.cellHeight * 0.5,
          'north')

      return this.renderAxisArrow(arrowPath)
    }

    renderSouthArrow () {
      const arrowPath =
        this.computeArrowPath(
          this.planeX + this.planeWidth/2,
          this.planeY + this.planeHeight,
          this.cellWidth * 0.5,
          this.cellHeight * 0.5,
          'south')

      return this.renderAxisArrow(arrowPath)
    }

    renderWestArrow () {
      const arrowPath =
        this.computeArrowPath(
          this.planeX,
          this.planeY + this.planeHeight/2,
          this.cellHeight * 0.5,
          this.cellWidth * 0.5,
          'west')

      return this.renderAxisArrow(arrowPath)
    }

    renderEastArrow () {
      const arrowPath =
        this.computeArrowPath(
          this.planeX + this.planeWidth,
          this.planeY + this.planeHeight/2,
          this.cellHeight * 0.5,
          this.cellWidth * 0.5,
          'east')

      return this.renderAxisArrow(arrowPath)
    }

    renderAxisArrow (arrowPath) {
      const arrow =
        this.paper
          .path(arrowPath)
          .attr({ fill: this.getAxisColor(), 'stroke-width': 0 })

      arrow.node.setAttribute('class', 'axis-arrow')
      this.addShape(arrow)
      return arrow
    }

    computeArrowPath (x, y, w, h, direction) {
      if (direction === 'north')
        return `M${x},${y}L${(x - w/2)},${(y + h)}L${(x + w/2)},${(y + h)}L${x},${y}Z`

      if (direction === 'west')
        return `M${x},${y}L${(x + w)},${(y - h/2)}L${(x + w)},${(y + h/2)}L${x},${y}Z`

      if (direction === 'south')
        return `M${x},${y}L${(x - w/2)},${(y - h)}L${(x + w/2)},${(y - h)}L${x},${y}Z`

      if (direction === 'east')
        return `M${x},${y}L${(x - w)},${(y - h/2)}L${(x - w)},${(y + h/2)}L${x},${y}Z`
    }

    renderStepLabel (stepValue, position, isYlabel) {
      const labelProperties =
        this.computeStepLabelProperties(stepValue, position, isYlabel)

      const labelAttributes = {
        fill: this.getColorPalette().foreground,
        'font-size': this.stepLabelFontSize,
        'font-family': 'Verdana',
        'letter-spacing': '0px'
      }

      const label =
        this.paper
          .text(0, 0, labelProperties.value)
          .attr(labelAttributes)

      let labelBoundingBox = label.getBBox()

      const stepLabelPadding = 5

      if (isYlabel) {
        labelProperties.y += (labelBoundingBox.height / 2) + stepLabelPadding
      } else {
        labelProperties.x -= (labelBoundingBox.width / 2) + stepLabelPadding
      }

      label.transform(`t${labelProperties.x},${labelProperties.y}`)

      // Get the new bounding box
      labelBoundingBox = label.getBBox()

      // Add a background
      const stepLabelBackground =
        this.paper
          .rect(
            labelBoundingBox.x,
            labelBoundingBox.y + (this.stepLabelFontSize/6),
            labelBoundingBox.width,
            labelBoundingBox.height - (this.stepLabelFontSize/4))
          .attr({
            fill: this.getColorPalette().background,
            stroke: 'none'
          })

      stepLabelBackground.node.setAttribute('class', 'step-label-bg')
      this.addShape(stepLabelBackground)

      // Move the label text to the top
      label.toFront()
      return label
    }

    renderClipBox (id) {
      let defsElements = this.paper.canvas.getElementsByTagName('defs')
      if (defsElements.length === 0) return

      let defs = defsElements[0]

      let clipBox = this.svg('clipPath', { id: id })

      const bw = this.getBorderWidth()
      const box = this.getInnerBoundingRect()
      const xyAdjust = bw
      const whAdjust = bw * 2

      const clipRect =
          this.svg('rect', {
              'x': box.x + xyAdjust,
              'y': box.y + xyAdjust,
              'width': box.width - whAdjust,
              'height': box.height - whAdjust
            })

      clipBox.appendChild(clipRect)
      defs.appendChild(clipBox)
    }

    svg (element, attributes) {
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', element)

      Object.entries(attributes).forEach(([attribute, value]) => {
        svgEl.setAttribute(attribute, value)
      })

      return svgEl
    }

    computeStepLabelProperties (stepValue, position, isXLabel) {
      let x, y, value
      if (isXLabel) {
        x = position
        y = this.valueYtoPixelY(0)
        value =
          this.xLabelPrecision == 0
            ? stepValue
            : stepValue.toFixed(this.xLabelPrecision)

      } else {
        x = this.valueXtoPixelX(0)
        y =
          stepValue < 0
            ? position - (this.stepLabelFontSize/6)
            : position
        value =
          this.yLabelPrecision == 0
            ? stepValue
            : stepValue.toFixed(this.yLabelPrecision)
      }

      if (value < 0) {
        value = value.toString().replace("-", "−")
      }

      return { x: x, y: y, value: value }
    }

    computeLinePath (sx, sy, ex, ey) {
      return `M${sx},${sy}L${ex},${ey}`
    }

    valueXtoPixelX (x) {
      return (this.cellWidth * (x / this.xstep + this.vlines / 2)) + this.planeX
    }

    valueYtoPixelY (y) {
      return this.planeY + this.planeHeight - ((y / this.ystep + this.hlines / 2) * this.cellHeight)
    }

    getColorPalette () {
      return this.colorPalette
    }

    setColorPalette (palette) {
      this.colorPalette = palette
    }

    getAxisColor () {
      return this.getColorPalette().acolor
    }

    getAxisLineWidth () {
      return this.axislinewidth
    }

    setAxisLineWidth (axislinewidth) {
      this.axislinewidth = axislinewidth
    }

    getBorderColor () {
      return this.getColorPalette().bcolor
    }

    getBorderWidth () {
      return this.borderwidth
    }

    setBorderWidth (borderwidth) {
      this.borderwidth = borderwidth
    }

    getStepLineWidth () {
      return this.steplinewidth
    }

    setStepLineWidth (steplinewidth) {
      this.steplinewidth = steplinewidth
    }

    getStepLineAttributes () {
      return {
        stroke: this.getColorPalette().foreground,
        'stroke-width': this.getStepLineWidth()
      }
    }

    updateRenderingProperties (palette) {
      this.setColorPalette(palette)

      // Iterate through all of the interesting shapes
      this.getShapes().forEach((shape) => {

        if (shape.type === 'path') {
          if (this.isAxisPath(shape)) {
            shape.attr({ stroke: this.getAxisColor() })
          } else if (this.isAxisArrowPath(shape)) {
            shape.attr({ fill: this.getAxisColor() })
          } else {
            shape.attr({ stroke: palette.foreground })
          }
          return
        }

        if (shape.type === 'text') {
          shape.attr({ fill: palette.foreground })
          return
        }

        if (shape.type === 'rect') {
          if (shape.node.getAttribute('class') === 'plane-outer-border')
            shape.attr({ stroke: this.getBorderColor(), fill: palette.background})
          else
            shape.attr({ stroke: 'none', fill: palette.background })
        }

      })
    }

    isAxisPath (el) {
      const clazz = el.node.getAttribute('class')
      return ((clazz === 'x-axis') || (clazz === 'y-axis'))
    }

    isAxisArrowPath (el) {
      return (el.node.getAttribute('class') === 'axis-arrow')
    }

    getBoundingRect () {
      return this.boundingRect
    }

    setBoundingRect (rect) {
      this.boundingRect = { x: rect.x, y: rect.y, width: rect.width , height: rect.height }
    }

    getInnerBoundingRect () {
      return this.rect
    }

    setInnerBoundingRect (rect) {
      this.rect = rect
    }

    computeSnappingMatrix () {
      this.computeXmatrix()
      this.computeYmatrix()
    }

    computeXmatrix () {
      const pxArray = []
      const vxArray = []
      const xsubsteps = this.xsubsteps
      const vxTick = new BigNumber(this.xstep).dividedBy(new BigNumber(xsubsteps))
      const pxTick = this.cellWidth / xsubsteps

      for (let i=0; i <= this.vlines; i++) {
        const px = (i * this.cellWidth) + this.planeX
        const vx = (i - this.vlines / 2) * this.xstep
        pxArray.push(px)
        vxArray.push(vx)

        for (let j=1; ((i < this.vlines) && (j < xsubsteps)); j++) {
          pxArray.push(px + (pxTick*j))
          let vxSubstep = new BigNumber(vx).plus(vxTick.multipliedBy(new BigNumber(j)))
          vxArray.push(vxSubstep.dp(this.xPrecision).toNumber())
        }
      }

      this.pxArray = pxArray
      this.vxArray = vxArray
    }

    computeYmatrix () {
      const pyArray = []
      const vyArray = []

      const ysubsteps = this.ysubsteps
      const vyTick = new BigNumber(this.ystep).dividedBy(new BigNumber(ysubsteps))
      const pyTick = this.cellHeight / ysubsteps

      for (let i=0; i<=this.hlines; i++) {
        let py = (i * this.cellHeight) + this.planeY
        let vy = (this.hlines / 2 - i) * this.ystep
        pyArray.push(py)
        vyArray.push(vy)

        for (let j=1; ((i < this.hlines) && (j < ysubsteps)); j++) {
          pyArray.push(py + (pyTick*j))
          let vySubstep = new BigNumber(vy).minus(vyTick.multipliedBy(new BigNumber(j)))
          vyArray.push(vySubstep.dp(this.yPrecision).toNumber())
        }
      }

      this.pyArray = pyArray
      this.vyArray = vyArray
    }

    getPXY (vx, vy) {
      return { x: this.getPX(vx), y: this.getPY(vy) }
    }

    getPX (vx) {
      const index = this.findNearestIndex(vx, this.vxArray)
      if (index === -1) return null
      return this.pxArray[index]
    }

    getPY (vy) {
      const index = this.findNearestIndex(vy, this.vyArray)
      if (index === -1) return null
      return this.pyArray[this.vyArray.length - index - 1]
    }

    getVXY (px, py) {
      return { x: this.getVX(px), y: this.getVY(py) }
    }

    getVX (px) {
      const index = this.findNearestIndex(px, this.pxArray)
      if (index === -1) return null
      return this.vxArray[index]
    }

    getVY (py) {
      const index = this.findNearestIndex(py, this.pyArray)
      if (index === -1) return null
      return this.vyArray[this.vyArray.length - index - 1]
    }

    findNearestIndex (value, values) {
      let minIndex = 0
      let maxIndex = values.length - 1

      while (maxIndex >= minIndex) {
        if (maxIndex == minIndex + 1) {
          const index =
            this.isValueNearerToLowerNumber (value, values[minIndex], values[maxIndex])
              ? minIndex
              : maxIndex
          return index
        }

        const iMid = this.computeAverage(minIndex, maxIndex)
        if (value == values[iMid]) return iMid

        if (value < values[iMid])
          maxIndex = iMid
        else
          minIndex = iMid
      }
      return -1
    }

    isValueNearerToLowerNumber (value, lower, higher) {
      const diff1 = Math.abs(value-lower)
      const diff2 = Math.abs(value-higher)

      if (diff1 <= diff2) return true
      return false
    }

    computeAverage (a, b) {
      return Math.round((a + b) / 2)
    }

    isValidPointValue (value) {
      const xMin = this.xMin
      const xMax = this.xMax
      const isValidX = ((value.x >= xMin) && (value.x <= xMax))
      if (!isValidX) return false
      const yMin = this.yMin
      const yMax = this.yMax
      return ((value.y >= yMin) && (value.y <= yMax))
    }

    stepLabelFontSize () {
      const xprops = this.computeStepLabelStringProps(this.vlines, this.xstep)
      const yprops = this.computeStepLabelStringProps(this.hlines, this.ystep)
      return this.adjustStepLabelFontSize(((xprops.w > yprops.w) ? xprops.s : yprops.s))
    }

    adjustStepLabelFontSize (stepLabel) {
      let safeSize = 10
      let fontSize = 10

      // Establish initial test label
      const label =
        this.paper
          .text(0, 0, stepLabel)
          .attr({
            'font-family' : 'Verdana',
            'font-size' : safeSize,
            'letter-spacing' : '0px'
          })

      const chLimit = this.cellHeight / 1.5
      const cwLimit = this.cellWidth / 1.5

      do {
        // Make the label a little bit larger.
        fontSize++
        label.attr('font-size', fontSize)
        // Compute the new width and height
        const labelProps = this.getLabelSize(label)

        if ((fontSize >= 16) ||
            (labelProps.height >= chLimit) ||
            (labelProps.width >= cwLimit)) {
          // We've exceeded a threshold
          break
        }
        // Current fontSize becomes the new safeSize
        safeSize = fontSize
      } while (true)

      label.remove()
      return safeSize
    }

    computeStepLabelStringProps (lines, step) {
      const p = { s: '', w: 0 }
      for (let i=0; i<lines; i++ ) {
        let v = (i*step) - ((lines*step)/2)
        v = v.toString().toString().replace('-', '−')
        const text = this.paper.text(0, 0, v)
        if (text.getBBox().width > p.w) {
          p.w = text.getBBox().width
          p.s = v.toString()
        }
        text.remove()
      }
      return p
    }

    getLabelSize (label) {
      const boundingBox = label.getBBox()
      return {
        'width': Math.round(boundingBox.width),
        'height' : Math.round(boundingBox.height)
      }
    }

    getShapes () {
      return this.shapes
    }

    setShapes (shapes) {
      this.shapes = shapes
    }

    addShape (shape) {
      this.shapes.push(shape)
    }

    getPaper () {
      return this.paper
    }

    setPaper (paper) {
      this.paper = paper
    }

    destroy () {
      this.paper.remove()
    }

  }

  return FullPlane
});
