/*
 * Fraction bar: a small portable custom interaction (QTI 3 PCI) for the showcase test.
 * The candidate shades parts of a bar; the response is the number of shaded parts (integer).
 *
 * Properties (data-* attributes on the interaction):
 *   data-parts  number of parts in the bar (default 8)
 *   data-label  accessible name for the bar
 */
define(['qtiCustomInteractionContext'], function (ctx) {
  'use strict';

  var TYPE = 'urn:cito:pci:showcase:fraction-bar';

  function createInstance(dom, config, state) {
    var properties = (config && config.properties) || {};
    var parts = parseInt(properties.parts, 10) || 8;
    var shaded = [];
    for (var i = 0; i < parts; i++) shaded.push(false);

    if (typeof state === 'string' && state) {
      try {
        var saved = JSON.parse(state);
        if (Array.isArray(saved.shaded) && saved.shaded.length === parts) shaded = saved.shaded.map(Boolean);
      } catch (e) {
        /* ignore an unreadable state */
      }
    }

    var style = document.createElement('style');
    style.textContent =
      '.fraction-bar{display:flex;max-width:560px;border:3px solid #1f5f8b;border-radius:8px;overflow:hidden}' +
      '.fraction-bar button{flex:1;height:72px;margin:0;border:0;border-inline-end:2px solid #1f5f8b;background:#ffffff;cursor:pointer;font:inherit}' +
      '.fraction-bar button:last-child{border-inline-end:0}' +
      '.fraction-bar button[aria-pressed="true"]{background:#45a8ad}' +
      '.fraction-bar button:focus-visible{outline:3px solid #e0523f;outline-offset:-5px}' +
      '.fraction-bar-count{margin-top:.5rem;color:#1d3b53}';

    var bar = document.createElement('div');
    bar.className = 'fraction-bar';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', properties.label || 'Bar to shade');

    var count = document.createElement('p');
    count.className = 'fraction-bar-count';
    count.setAttribute('aria-live', 'polite');

    var instance;

    function shadedCount() {
      return shaded.filter(Boolean).length;
    }

    function render() {
      var buttons = bar.querySelectorAll('button');
      for (var b = 0; b < buttons.length; b++) buttons[b].setAttribute('aria-pressed', String(shaded[b]));
      count.textContent = shadedCount() + ' of ' + parts + ' parts shaded';
    }

    for (var p = 0; p < parts; p++) {
      (function (index) {
        var button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', 'Part ' + (index + 1));
        button.addEventListener('click', function () {
          shaded[index] = !shaded[index];
          render();
          dom.dispatchEvent(
            new CustomEvent('qti-interaction-changed', {
              bubbles: true,
              cancelable: true,
              detail: {
                interaction: instance,
                responseIdentifier: config.responseIdentifier,
                valid: true,
                value: instance.getResponse()
              }
            })
          );
        });
        bar.appendChild(button);
      })(p);
    }

    dom.appendChild(style);
    dom.appendChild(bar);
    dom.appendChild(count);
    render();

    instance = {
      typeIdentifier: TYPE,
      getResponse: function () {
        return { base: { integer: shadedCount() } };
      },
      getState: function () {
        return JSON.stringify({ shaded: shaded });
      },
      oncompleted: function () {
        var buttons = bar.querySelectorAll('button');
        for (var b = 0; b < buttons.length; b++) buttons[b].disabled = true;
      }
    };

    if (config && typeof config.onready === 'function') config.onready(instance, state);
    return instance;
  }

  ctx.register({
    typeIdentifier: TYPE,
    getInstance: createInstance
  });
});
