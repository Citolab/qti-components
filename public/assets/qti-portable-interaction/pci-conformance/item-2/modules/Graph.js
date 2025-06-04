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

define(['PlottedPoint'], function(PlottedPoint) {

  class Graph {

    config = null
    container = null
    plane = null
    plottedPoints = null
    fixedPoints = null
    plottedLinePath = null
    fixedPointLinePath = null
    hitbox = null
    clipbox = null
    titleEl = null
    isValidResponse
    isDisabled
    pointProperties
    minPoints
    maxPoints
    lineStrokeWidth
    colorPalette = {
      foreground: '#000',
      background: '#fff',
      point: '#da70d6',
      fixedpoint: '#009688'
    }

    constructor (config, container, plane, isDisabled, state) {
      this.config = config
      this.minPoints = this.config.minPoints
      this.maxPoints = this.config.maxPoints
      this.lineStrokeWidth = this.config.lineStrokeWidth
      this.colorPalette = this.config.colorPalette
      this.container = container
      this.plane = plane
      this.isDisabled = isDisabled
      this.plottedPoints = []
      this.fixedPoints = []
      this.isValidResponse = false

      // Initialize the event handler function references
      this.onPointDelete = this.deletePoint.bind(this)
      this.onPointDragStart = this.handlePointDragStart.bind(this)
      this.onPointDragEnd = this.handlePointDragEnd.bind(this)

      this.initialize(state)
      return this
    }

    initialize (state) {
      this.initializePlottedLinePath()
      this.renderHitbox(this)
      this.renderClipbox()

      this.setPointProperties(
        this.createPlottedPointProperties(
          this.plane,
          this.getPointColor()))

      if (this.config.hasOwnProperty('title'))
        this.renderTitle(this.config.title)

      if (this.config.hasOwnProperty('fixedpoints'))
        this.renderFixedPoints(this.config.fixedpoints, this)

      if (typeof state !== 'undefined')
        this.setState(state)

      this.addEventListeners()

      if (this.isDisabled)
        this.toggleDisable(true)
    }

    getState () {
      const points = []
      this.plottedPoints.forEach(p => {
        points.push({ x: p.getVX(), y: p.getVY() })
      })
      return { points: points }
    }

    setState (state) {
      const event = { restore: true }
      for (let i=0; i<state.points.length; i++) {
        const point = state.points[i]
        const pxy = this.plane.getPXY(point.x, point.y)
        event.X = pxy.x
        event.Y = pxy.y
        this.handleHitboxClick(event)
      }
      this.evaluateValidity()
    }

    getPointColor () {
      return {
        color: this.colorPalette.point,
        background: this.colorPalette.background
      }
    }

    getFixedPointColor () {
      return {
        color: this.colorPalette.fixedpoint,
        background: this.colorPalette.background
      }
    }

    disable () {
      this.toggleDisable(true)
    }

    enable () {
      this.toggleDisable(false)
    }

    toggleDisable (isDisabled) {
      this.isDisabled = isDisabled

      if (isDisabled) {
        // Disable the hitbox
        this.hitbox.click(function(){})
        this.hitbox.toBack()
        // Disable points
        this.disablePlottedPoints()
      } else {
        // Enable the hitbox
        this.hitbox.click(this.handleHitboxClick)
        this.plottedLinePath.toFront()
        this.hitbox.toFront()
        // Enable points
        this.enablePlottedPoints()
        // Plotted Points on top of the hitbox
        this.movePointsToFront(this.plottedPoints)
      }
    }

    enablePlottedPoints () {
      this.plottedPoints.forEach(p => {
        p.enable()
      })
    }

    disablePlottedPoints () {
      this.plottedPoints.forEach(p => {
        p.disable()
      })
    }

    destroy () {
      this.removeEventListeners()
      this.plottedPoints = null
      this.container.remove()
      this.container = null
      this.plottedLinePath = null
      this.fixedPointLinePath = null
      this.hitbox = null
      this.staticPoints = null
      this.plane.destroy()
      this.plane = null
    }

    renderHitbox () {
      const box = this.plane.getInnerBoundingRect()

      // Hitbox takes on the dimensions of the inner bounding rectangle
      this.hitbox =
        this.plane.getPaper()
          .rect(box.x, box.y, box.width, box.height)
          .attr({ opacity: 0, fill: '#0000FF', cursor: 'crosshair' })

      this.hitbox.node.setAttribute('class', 'hitbox')
    }

    renderClipbox () {
      this.clipbox = this.createId('clipbox')
      this.plane.renderClipBox(this.clipbox)
    }

    createPlottedPointProperties (coordinatePlane, palette) {
      return {
        plane : coordinatePlane,
        color : palette.color,
        background: palette.background,
        radius : 8,
        isFixed: false
      }
    }

    renderTitle (title) {
      if (title === '') return

      const svgEl = this.container.querySelector('svg')
      const width = svgEl.getBoundingClientRect().width

      this.titleEl = document.createElement('div')
      // Apply svg width to the graph title div
      this.titleEl.style.width = `${width}px`
      this.titleEl.classList.add('graph-title')
      this.titleEl.innerHTML = title

      // Insert the title before the coordinate plane svg
      this.container.insertBefore(this.titleEl, svgEl)
    }

    renderFixedPoints (fixedPoints, container) {
      if (fixedPoints.points.length === 0) return

      const palette = this.getFixedPointColor()

      const fixedPointProperties = {
        plane: this.plane,
        color: palette.color,
        background: palette.background,
        radius: 8,
        isFixed: true
      }

      fixedPoints.points.forEach(p => {
        // Patch a label if one exists
        if (p.hasOwnProperty('label')) {
          fixedPointProperties.label = p.label
          fixedPointProperties.orientlabel = p.hasOwnProperty('orientlabel') ? p.orientlabel : 'top-left'
        }

        const fixedPoint = new PlottedPoint(fixedPointProperties, container)
        const pxy = this.plane.getPXY(p.x, p.y)
        fixedPoint.setPointToPixel({ x: pxy.x, y: pxy.y })
        this.fixedPoints.push(fixedPoint)
      })

      this.fixedPoints.forEach(p => {
        if (p.hasLabel()) {
          const props = p.computeLabelOrientationProperties()
          p.setLabelOrientation(props.x, props.y)
        }
      })

      // Permit a line connecting Primary fixed points
      if (fixedPoints.connect) {
        // Initialize a new path for the line connecting the fixed points
        this.fixedPointLinePath = this.plane.getPaper().path('')
        this.renderLine(this.fixedPoints, palette.color, this.fixedPointLinePath)
        this.hitbox.toFront()
      }
    }

    initializePlottedLinePath () {
      this.plottedLinePath = this.plane.getPaper().path('')
      this.plottedLinePath.attr({ path: '', 'fill-opacity': 0 })
    }

    addEventListeners () {
      this.hitbox.click(this.handleHitboxClick)
      this.container.addEventListener('point.dragstart',  this.onPointDragStart)
      this.container.addEventListener('point.dragend', this.onPointDragEnd)
      this.container.addEventListener('point.delete',  this.onPointDelete)
    }

    removeEventListeners () {
      this.hitbox.unclick(this.handleHitboxClick)
      this.container.removeEventListener('point.dragstart',  this.onPointDragStart)
      this.container.removeEventListener('point.dragend', this.onPointDragEnd)
      this.container.removeEventListener('point.delete',  this.onPointDelete)
    }

    handleHitboxClick = (e) => {
      const restoring = e.hasOwnProperty('restore') ? true : false
      const o = this.getSvgPageOffset(this.container.querySelector('svg'))
      const px = restoring ? e.X : e.pageX - o.left
      const py = restoring ? e.Y : e.pageY - o.top
      const values = this.plane.getVXY(px, py)
      this.addPoint(values.x, values.y, restoring, this)
    }

    addPoint (vx, vy, restoring, parent) {
      const value = { x: vx, y: vy }
      let point

      if (this.plane.isValidPointValue(value) && this.isPointValueAvailable(vx, vy)) {
        if ((this.maxPoints === 0) || (this.plottedPoints.length < this.maxPoints)) {
          point = new PlottedPoint(this.getPointProperties(), parent)
          this.plottedPoints.push(point)
          if (!restoring) this.evaluateValidity()
        } else {
          point = this.plottedPoints[this.plottedPoints.length-1]
        }

        point.setPointToValue(value)
        if (!restoring) this.notifyPointChange('add')
      }

      this.renderPlottedLine()
      return point
    }

    deletePoint (event) {
      const point = event.detail // event.detail is a PlottedPoint

      if (this.isDisabled) return
      if (!(point instanceof PlottedPoint)) return

      if (this.plottedPoints.indexOf(point) !== -1) {
        point.destroy()
        this.plottedPoints.splice(this.plottedPoints.indexOf(point), 1)
        this.hidePlottedLine()
        this.evaluateValidity()
        this.renderPlottedLine()

        this.notifyPointChange('delete')
      }
    }

    handlePointDragStart (event) {
      const point = event.detail // event.detail is a PlottedPoint

      if (this.isDisabled) return
      if (!(point instanceof PlottedPoint)) return

      if (this.plottedPoints.indexOf(point) !== -1) {
        this.hidePlottedLine()
      }
    }

    handlePointDragEnd (event) {
      const point = event.detail // event.detail is a PlottedPoint

      if (this.isDisabled) return
      if (!(point instanceof PlottedPoint)) return

      if (this.plottedPoints.indexOf(point) !== -1) {
        this.renderPlottedLine()
        this.notifyPointChange('move')
      }
    }

    notifyPointChange (changeType) {
      console.log(`[Graphing PCI][Change:${changeType}][IsValid:${this.getIsValid()}]`)

      const e =
        new CustomEvent(
            'graph.change',
            { bubbles: true, detail: {}
          })

      this.container.dispatchEvent(e)
    }

    renderPlottedLine () {
      if (this.config.graphtype === 'scatter') return
      this.renderLine(this.plottedPoints.slice(0), this.getPointColor().color, this.plottedLinePath)
    }

    renderLine (points, color, path) {
      if (points.length === 0) return
      this.hidePlottedLine()
      this.line(points, color, path)
    }

    /**
     * @description Draw a line between the first two points in the points array.
     */
    line (points, color, linePath) {
      // Bail if we don't have at least 2 points
      if (points.length < 2) return

      // Use pixel values of the first two points to compute the line coordinates.
      const a = { x: points[0].getPX(), y: points[0].getPY() }
      const b = { x: points[1].getPX(), y: points[1].getPY() }
      const coords = this.computeLinePathCoordinates(a, b)

      // Draw the line
      linePath.attr({
        path: `M ${coords.sx} ${coords.sy} L ${coords.ex} ${coords.ey}`,
        stroke: color,
        'stroke-width': this.lineStrokeWidth,
      })

      // Clip the line with the clipbox
      linePath.node.setAttribute('clip-path', `url(#${this.clipbox})`)
      // Bring the line to the top
      linePath.toFront()
      // Points on top of the line
      this.movePointsToFront(points)
    }

    movePointsToFront (points) {
      points.forEach(point => {
        point.moveToFront()
      })
    }

    hidePlottedLine () {
      if (this.plottedLinePath == null) return
      // Make the plotted line invisible
      this.plottedLinePath.attr({ path: '', 'fill-opacity': 0 })
    }

    getSvgPageOffset (svg) {
      let w = svg.ownerDocument.defaultView
      let r = svg.getBoundingClientRect()
      return ({
        top: r.top + w.pageYOffset,
        left: r.left + w.pageXOffset
      })
    }

    getPointProperties () {
      return this.pointProperties
    }

    setPointProperties (props) {
      this.pointProperties = props
    }

    /**
     * @description Iterate through all fixed and plotted points to determine
     * if the provided point is available for plotting.
     *
     * The idea is to prevent a point from being plotted over the top of
     * another point.
     */
    isPointValueAvailable (vx, vy, point) {
      // Make a list of all the points (plotted and fixed)
      const allpoints = this.plottedPoints.concat(this.fixedPoints)
      // Compare the values of x and y to each point in the list
      for (let i=0; i<allpoints.length; i++) {
        const p = allpoints[i]
        if ((p !== point) && (vx === p.getVX()) && (vy === p.getVY())) {
          return false
        }
      }
      return true
    }

    computeLinePathCoordinates (a, b) {
      const box = this.plane.getInnerBoundingRect()

      // Compute horizontal line
      if (a.y === b.y) {
        return {
          sx: box.x,
          sy: a.y,
          ex: box.x + box.width,
          ey: a.y
        }
      }

      // Compute vertical line
      if (a.x === b.x) {
        return {
          sx: a.x,
          sy: box.y,
          ex: a.x,
          ey: box.y + box.height
        }
      }

      // Compute based on slope
      const slope = (a.y - b.y) / (a.x - b.x)
      let sx = box.x
      let sy = slope * (box.x - a.x) + a.y
      let ex = box.x + box.width
      let ey = slope * (ex - a.x) + a.y

      if (sy < box.y) {
        sy = box.y
        sx = a.x + (box.y - a.y) / slope

      } else if (sy > (box.height + box.y)) {
        sy = box.height + box.y
        sx = a.x + (sy - a.y) / slope
      }

      if (ey < box.y) {
        ey = box.y
        ex = a.x + (box.y - a.y) / slope

      } else if (ey > box.height + box.y) {
        ey = box.height + box.y
        ex = a.x + (ey - a.y) / slope
      }

      return {
        sx: sx,
        sy: sy,
        ex: ex,
        ey: ey
      }
    }

    /**
     * @description Method to change the colors for all points and lines
     * of this graph.
     * @param {Object} palette { foreground: '<color>', background: '<color>', point: '<color>', fixedpoint: '<color>' }
     */
    updateRenderingProperties (palette) {
      this.colorPalette = palette

      this.setPointProperties(
        this.createPlottedPointProperties(
          this.plane,
          this.getPointColor()))

      this.fixedPoints.forEach(point => {
        point.updateRenderingProperties({ foreground: palette.fixedpoint, background: palette.background })
      })

      if ((this.fixedPointLinePath !== null) && (this.fixedPointLinePath.attr('path') !== '')) {
        this.fixedPointLinePath.attr('stroke', palette.fixedpoint)
      }

      this.plottedPoints.forEach(point => {
        point.updateRenderingProperties({ foreground: palette.point, background: palette.background })
      })

      if ((this.plottedLinePath !== null) && (this.plottedLinePath.attr('path') !== '')) {
        this.plottedLinePath.attr('stroke', palette.point)
      }
    }

    /**
     * @description The determines an interaction's validity status based
     * on the min-choices attribute.
     * @return {Boolean} (true if valid, false if invalid)
     */
    computeIsValid () {
      // If minPoints is 0, there are no constraints
      if ((this.minPoints) === 0) return true
      // minPoints is > 0.  There are constraints.
      return this.plottedPoints.length >= this.minPoints
    }

    /**
     * @description Evaluate the interaction's response validity.
     * Update the interaction's validity if there is a change.
     */
    evaluateValidity () {
      // Get old validity value
      const priorValidity = this.getIsValid()
      // Compute new validity value
      const currentValidity = this.computeIsValid()
      // Bail if no change
      if (priorValidity === currentValidity) return
      // There is a change.
      this.updateValidity(currentValidity)
    }

    /**
     * @description Update the interaction's validity.
     * @param {Boolean} isValid
     */
    updateValidity (isValid) {
      this.setIsValid(isValid)
      // Send change in validity event up the chain
      // TODO: trigger event
    }

    getIsValid () {
      return this.isValidResponse
    }

    setIsValid (isValid) {
      this.isValidResponse = isValid
    }

    createId (label) {
      return (label + '-' + this.randomString(5, 'a'))
    }

    /**
     * @description Pseudo-random string generator
     * http://stackoverflow.com/a/27872144/383904
     * Default: return a random alpha-numeric string
     *
     * @param {Integer} len Desired length
     * @param {String} an Optional (alphanumeric), "a" (alpha), "n" (numeric)
     * @return {String}
     */
    randomString (len, an) {
      an = an && an.toLowerCase()
      let s = ''
      const min = an == 'a' ? 10 : 0
      const max = an == 'n' ? 10 : 62
      for (let i=0; i < len; i++) {
        let r = Math.random() * (max - min) + min << 0
        s += String.fromCharCode(r += r > 9 ? r < 36 ? 55 : 61 : 48)
      }
      return s
    }

  }

  return Graph
});