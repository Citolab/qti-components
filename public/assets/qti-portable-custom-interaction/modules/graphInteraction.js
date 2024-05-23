/** Edmentum GraphInteraction: A Custom Interaction Hook implemented as an AMD Module. */
define(['qtiCustomInteractionContext', 'd3'], function (ctx, d3) {
  const selectors = {
    prompt: '.graph-interaction__prompt',
    canvas: '.graph-interaction__canvas'
  };

  const defaults = {
    step: 1,
    min: -10,
    max: 10,
    padding: 10,
    width: 520,
    height: 520,
    precision: 1
  };

  function Interaction(dom) {
    this.points = [];
    this.$prompt = dom.querySelector(selectors.prompt);
    this.$canvas = dom.querySelector(selectors.canvas);
  }

  Interaction.prototype = {
    createPoint: function (x, y, coords) {
      return {
        x: x,
        y: y,
        coords: !coords ? this.coords(x, y) : coords
      };
    },

    addPoint: function (x, y, coords) {
      this.points.push(this.createPoint(x, y, coords));
      this.redraw();
    },

    redraw: function () {
      this.$$points
        .selectAll('circle')
        .data(this.points)
        .enter()
        .append('circle')
        .attr('fill', '#BBF')
        .attr('stroke', '#348')
        .attr('transform', function (d) {
          return 'translate(' + d.coords[0] + ',' + d.coords[1] + ')';
        })
        .attr('r', 4);

      if (this.points.length > 1) {
        const points = this.points.map(function (point) {
          return point.coords;
        });
        this.$$line.attr('d', d3.line().curve(d3.curveCardinal)(points));
      }
    },

    coords: function (x, y) {
      return [this.xf(x) + defaults.padding, this.yf(y) + defaults.padding];
    },

    response: function (value) {
      if (typeof value === 'undefined') {
        return this.points
          .map(function (point) {
            return point.x + ',' + point.y;
          })
          .join();
      }

      if (typeof value === 'string') {
        this.points = [];
        if (value.length > 0) {
          const dots = value.split(',');
          for (var i = 0; i < dots.length; i += 2) {
            this.points.push(this.createPoint(dots[i], dots[i + 1]));
          }
        }

        this.redraw();
      }
    },

    render: function (data, state) {
      this.$prompt.innerHTML = data.prompt || '';
      this.svg(this.$canvas, data);

      // Restore state if one is provided
      if (state !== null) this.response(state);
    },

    svg: function (element, data) {
      const addPoint = this.addPoint.bind(this);
      const padding = defaults.padding;
      const width = data.width;
      const height = data.height;
      const cwidth = width + 2 * padding + 1;
      const cheight = height + 2 * padding + 1;
      const dx = width / 2 + padding;
      const dy = height / 2 + padding;
      const xcount = (data.x.max - data.x.min) / data.x.step;
      const ycount = (data.y.max - data.y.min) / data.y.step;
      const x = d3.scaleLinear().domain([data.x.min, data.x.max]).range([0, width]);
      const y = d3.scaleLinear().domain([data.y.max, data.y.min]).range([0, height]);
      let svg = d3.select(element).append('svg:svg').attr('height', cwidth).attr('width', cheight);

      // render grid pattern
      svg
        .append('svg:pattern')
        .attr('id', 'grid')
        .attr('width', width / xcount)
        .attr('height', height / ycount)
        .attr('patternUnits', 'userSpaceOnUse')
        .append('svg:path')
        .attr('d', 'M 22 0 L 0 0 0 22')
        .attr('stroke', '#DDD')
        .attr('fill', 'none')
        .attr('stroke-width', '2')
        .attr('stroke-dasharray', '4 3');
      svg
        .append('svg:rect')
        .attr('transform', 'translate(' + padding + ', ' + padding + ')')
        .attr('width', width + 1)
        .attr('height', height + 1)
        .attr('fill', 'url(#grid)');

      if (data.axes) {
        // render X axis
        svg
          .append('svg:g')
          .attr('transform', 'translate(' + padding + ', ' + dy + ')')
          .call(d3.axisBottom(x).ticks(xcount).tickSize(0));

        // render Y axis
        svg
          .append('svg:g')
          .attr('transform', 'translate(' + dx + ', ' + padding + ')')
          .call(d3.axisLeft(y).ticks(ycount).tickSize(0));
      }

      // render series group, used for drawinf the lines and points
      let series = svg.append('svg:g').classed('series', true);
      this.$$line = series
        .append('svg:path')
        .style('fill', 'none')
        .style('stroke', '#348')
        .style('stroke-width', '3px');
      this.$$points = series.append('svg:g').classed('points', true);

      // render overlay used for mouse pointer and events
      let overlay = svg.append('svg:g').classed('overlay', true);
      let guides = overlay
        .append('svg:circle')
        .attr('r', 4)
        .classed('pointer', true)
        .attr('fill', '#BBF')
        .attr('stroke', '#348')
        .attr('opacity', '0.2')
        .attr('visibility', 'hidden');

      overlay
        .append('svg:rect')
        .classed('mouse_area', true)
        .attr('width', cwidth)
        .attr('height', cheight)
        .attr('opacity', 0)
        .on('mouseenter', function () {
          guides.attr('visibility', 'visible');
        })
        .on('mouseout', function () {
          guides.attr('visibility', 'hidden');
        })
        .on('mousemove', function () {
          var coord = d3.mouse(this);
          guides.attr('transform', 'translate(' + coord[0] + ',' + coord[1] + ')');
        })
        .on('click', function () {
          var coord = d3.mouse(this);
          addPoint(
            x.invert(coord[0] - padding).toFixed(defaults.precision),
            y.invert(coord[1] - padding).toFixed(defaults.precision),
            coord
          );
        });

      this.xf = x;
      this.yf = y;
    }
  };

  let graphInteractionHook = {
    typeIdentifier: 'urn:edmentum.com:pci:2019:graphInteraction',

    config: null,

    interaction: null,

    // Track internal state
    _state: '', // empty string = no points

    /** @access public
     *  @method getInstance Create a new instance of this portable custom interaction
     *  Will be called by the qtiCustomInteractionContext
     *  @param {DOM Element} dom - the DOM Element this PCI is being added to
     *  @param {Object} configuration - the configuration to apply to this PCI
     *  @param {String} state - a previous saved state to apply to this instance.
     *  This must have been obtained from a prior call to getState on an
     *  instance of this type (same typeIdentifier)
     */
    getInstance: function (dom, config, state) {
      this.config = config;

      // If there is a provided prior state, init our internal state.
      if (typeof state !== 'undefined') {
        this.setState(state);
      }

      function parse(configRange, configStep) {
        let range = (configRange &&
          configRange.split(',').map(function (value) {
            return parseInt(value, 10);
          })) || [defaults.min, defaults.max];
        return {
          min: range[0],
          max: range[1],
          step: (configStep && parseInt(configStep, 10)) || defaults.step
        };
      }

      const width = (config.properties.width && parseInt(config.properties.width, 10)) || defaults.width;
      const height = (config.properties.height && parseInt(config.properties.height, 10)) || defaults.height;

      this.interaction = new Interaction(dom);
      this.interaction.render(
        {
          prompt: config.properties.prompt,
          x: parse(config.properties.x, config.properties.xStep),
          y: parse(config.properties.y, config.properties.yStep),
          axes: config.properties.showAxes !== 'false',
          width: width,
          height: height
        },
        state
      );
      config.onready(this);
    },

    getResponse: function () {
      // Return the points encoded as a string
      return { base: { string: this.getState() } };
    },

    setState: function (state) {
      this._state = state === null ? '' : state;
    },

    getState: function () {
      return this.interaction !== null ? this.interaction.response() : this._state;
    },

    resetState: function () {
      if (this.interaction === null) return;
      this.interaction.response('');
    }
  };

  if (ctx) {
    ctx.register(graphInteractionHook);
  }
});
