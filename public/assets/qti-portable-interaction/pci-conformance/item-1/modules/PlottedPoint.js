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

  class PlottedPoint {

    color
    background
    radius
    isFixed
    isEnabled
    plane
    label
    labelText
    labelOrientation
    labelFontSize
    labelSet
    vx
    vy
    px
    py
    parent
    container
    pointSet
    pointCircle
    haloCircle
    haloRadius
    haloOpacity
    moveThreshold

    constructor (pointProperties, parent) {
      this.parent = parent
      this.container = parent.container
      this.plane = pointProperties.plane
      this.color = pointProperties.color
      this.background = pointProperties.background
      this.radius = pointProperties.radius
      this.haloRadius = 46 - (this.radius * 2)
      this.haloOpacity = 0.2
      this.isFixed = pointProperties.isFixed
      this.isEnabled = true

      // Fixed points may have labels
      this.label = ('label' in pointProperties) ? pointProperties.label : null
      this.labelText = this.label
      this.labelOrientation = ('orientlabel' in pointProperties) ? pointProperties.orientlabel : 'top-left'
      this.labelFontSize = 16

      this.render()
    }

    render () {
      this.pointSet = this.renderPointSet()

      if (this.hasLabel()) {
        this.labelSet = this.createLabel(this.labelText)
      }

      if (!this.isFixed) {
        this.haloCircle.node.style.touchAction = 'none'
        this.pointCircle.node.style.touchAction = 'none'
        this.enableDraggableListeners()
      } else {
        this.pointSet.attr({
          cursor: 'crosshair',
          style: 'pointer-events: none'
        })
      }

    }

    renderPoint (pixel) {
      this.setPX(pixel.x)
      this.setPY(pixel.y)
      this.pointSet.attr({ cx: pixel.x, cy: pixel.y })
      this.moveToFront()
    }

    getLabelSet () {
      return (this.hasLabel() ? this.labelSet : null)
    }

    getBoundingRect () {
      return (!this.isFixed ? this.haloCircle.getBBox() : this.pointCircle.getBBox())
    }

    getLabelBoundingRect () {
      if (!this.hasLabel()) return
      return this.labelSet[0].getBBox()
    }

    setPointToPixel (pixel) {
      const vxy = this.plane.getVXY(pixel.x, pixel.y)
      const value = { x: vxy.x, y: vxy.y }
      if (this.plane.isValidPointValue(value) && this.parent.isPointValueAvailable(vxy.x, vxy.y, this)) {
        return this.setPointToValue(value)
      }

      this.resetPointToValue()
    }

    setPointToValue (value) {
      this.setVX(value.x)
      this.setVY(value.y)
      const pxy = this.plane.getPXY(value.x, value.y)
      this.renderPoint({ x: pxy.x, y: pxy.y })
    }

    hasLabel () {
      return (this.labelText === null ? false : true)
    }

    /**
     * Raphael has built-in support for four dragging events:
     *
     * raphael.drag.over, raphael.drag.start, raphael.drag.move, raphael.drag.end
     *
     * For graphing, we build listeners for the last three.
     */
    enableDraggableListeners () {
      this.start = function(x, y, e) {
        if (!this.plottedPoint.isEnabled) return

        // Save the event property
        this.plottedPoint.startDragEvent = e.originalEvent || e

        this.ox = this.attr('cx')
        this.oy = this.attr('cy')
      }

      this.drag = function(dx, dy, x, y, e) {
        if (!this.plottedPoint.isEnabled) return

        // Only start a drag/move if a point is moved by a certain amount
        if (((Math.abs(dx) > 2) || (Math.abs(dy) > 2))
            && (e instanceof this.plottedPoint.startDragEvent.constructor)) {
          this.plottedPoint.isDragging = true
          this.plottedPoint.dispatchEvent('point.dragstart')
          this.plottedPoint.pointSet.attr({ 'cx': this.ox + dx, 'cy': this.oy + dy })
          this.plottedPoint.scrollWindow(this.plottedPoint.getMousePosition(e))
        }
      }

      this.end = function() {
        if (!this.plottedPoint.isEnabled) return

        if (this.plottedPoint.isDragging) {
          const pX = this.attr('cx')
          const pY = this.attr('cy')
          this.plottedPoint.setPointToPixel({ x: pX, y: pY })

          if (this.plottedPoint) {
            // Delete the event property
            delete this.plottedPoint.startDragEvent
            this.plottedPoint.isDragging = false
            this.plottedPoint.dispatchEvent('point.dragend')
          }

        } else if (!this.plottedPoint.isFixed) {
          this.plottedPoint.dispatchEvent('point.delete')
        }
      }

      this.pointSet.drag(this.drag, this.start, this.end)
    }

    disableDraggableListeners () {
      this.pointSet.drag(function(){}, function(){}, function(){})
    }

    getMousePosition (event) {
      if (event.touches) event = event.touches[0]
      return { x: event.clientX, y: event.clientY }
    }

    enable () {
      this.isEnabled = true
      this.pointSet.remove()
      this.render()
      //this.setPointToPixel({ x: this.pixelX, y: this.pixelY })
      this.setPointToPixel({ x: this.px, y: this.py })
      this.moveToFront()
    }

    disable () {
      this.isEnabled = false
      this.haloCircle.remove()
      this.pointSet.undrag()
      this.pointCircle.attr({ cursor: 'auto' })
    }

    renderPointSet () {
      const elements = []
      this.pointCircle =
        this.plane.getPaper()
          .circle(0, 0, this.radius)
          .attr({ fill: this.color, cursor: 'move', stroke: 'black' })

      this.pointCircle.plottedPoint = this
      elements.push(this.pointCircle)

      if (!this.isFixed) {
        this.haloCircle =
          this.plane.getPaper()
            .circle(0, 0, this.haloRadius)
            .attr({ fill: this.color, opacity: this.haloOpacity, cursor : 'move', stroke : 'none' })

        this.haloCircle.plottedPoint = this
        elements.push(this.haloCircle)
      }

      return this.plane.getPaper().set(elements)
    }

    createLabel (labelText) {
      const label =
        this.plane.getPaper()
          .text(0, 0, labelText)
          .attr({
            fill: this.color,
            'font-family': 'Verdana',
            'font-size': this.labelFontSize,
            'font-weight': 'bold',
            'text-anchor': 'start'
          })

      label.node.setAttribute('class', 'point-label')

      const labelRect = label.getBBox()

      const labelBackground =
        this.plane.getPaper()
          .rect(labelRect.x, labelRect.y + 1, labelRect.width, labelRect.height - 3)
          .attr({
            fill: this.background,
            stroke: 'none'
           })

      return this.plane.getPaper().set([labelBackground, label])
    }

    resetPointToValue () {
      const v = this.plane.getVXY(this.px, this.py)
      this.setPointToValue({ x: v.x, y: v.y })
    }

    getPX () {
      return this.px
    }

    setPX (px) {
      this.px = px
    }

    getPY () {
      return this.py
    }

    setPY (py) {
      this.py = py
    }

    getVX () {
      return this.vx
    }

    setVX (vx) {
      this.vx = vx
    }

    getVY () {
      return this.vy
    }

    setVY (vy) {
      this.vy = vy
    }

    computeLabelOrientationProperties () {
      const pointRect = this.getBoundingRect()
      const labelRect = this.getLabelBoundingRect()
      switch (this.labelOrientation) {
        case 'top-left':
          return { x: pointRect.x - labelRect.width, y: pointRect.y - labelRect.height - labelRect.y }
        case 'top-right':
          return { x: pointRect.x + pointRect.width, y: pointRect.y - labelRect.height - labelRect.y }
        case 'bottom-right':
          return { x: pointRect.x + pointRect.width, y: pointRect.y + pointRect.height - labelRect.y }
        case 'bottom-left':
          return { x: pointRect.x - labelRect.width, y: pointRect.y + pointRect.height - labelRect.y }
        default: // default to top-left
          return { x: pointRect.x - labelRect.width, y: pointRect.y - labelRect.height - labelRect.y }
      }
    }

    setLabelOrientation (x, y) {
      this.labelSet.transform(`t${x},${y}`)
    }

    moveToFront () {
      this.pointSet.toFront()
      if (this.hasLabel()) this.labelSet.toFront()
    }

    updateRenderingProperties (palette) {
      this.color = palette.foreground
      this.background = palette.background

      this.pointSet.attr({'fill': this.color })

      if (this.hasLabel()) {
        this.labelSet[0].attr('fill', this.background)
        this.labelSet[1].attr('fill', this.color)
      }
    }

    scrollWindow (mouse) {
      let scrollX = 0
      let scrollY = 0

      const margin = 16
      const scrollAmount = 4

      // Check vertical scrolling
      if (mouse.y < margin) {
        scrollY = -scrollAmount
      } else if (mouse.y > (window.innerHeight - margin)) {
        scrollY = scrollAmount
      }

      // Check horizontal scrolling
      if (mouse.x < margin) {
        scrollX = -scrollAmount
      } else if (mouse.x > (window.innerWidth - margin)) {
        scrollX = scrollAmount
      }

      window.scrollBy(scrollX, scrollY)
    }

    dispatchEvent (s) {
      const event = new CustomEvent(s, { detail: this })
      this.container.dispatchEvent(event)
    }

    destroy () {
      this.pointSet.remove()
      this.pointSet.undrag()
      this.labelSet && this.labelSet.remove()
      this.displayCircle = null
      this.haloCircle = null
      this.labelSet = null
      this.pointSet = null
    }
  }

  return PlottedPoint
});