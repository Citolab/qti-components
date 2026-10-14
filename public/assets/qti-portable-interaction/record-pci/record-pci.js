/*
 * A minimal PCI bound to a response with record cardinality, for tests.
 *
 * Clicking "Answer" reports the record from its data-time / data-x / data-y properties as
 * QTI Appendix C JSON through a qti-interaction-changed event:
 *   { record: [{ name: 'time', base: { float } }, { name: 'point', base: { point: [x, y] } }] }
 * It shows the boundTo it was constructed with, so a restored record can be checked.
 */
define(['qtiCustomInteractionContext'], function (ctx) {
  'use strict';

  ctx.register({
    typeIdentifier: 'urn:fdc:qti-components:test:recordPci',
    getInstance: function (dom, config) {
      var properties = config.properties || {};
      var response = (config.boundTo && config.boundTo[config.responseIdentifier]) || undefined;

      var output = document.createElement('pre');
      output.setAttribute('data-testid', 'bound-to');
      output.textContent = JSON.stringify(response || null);

      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Answer';
      button.addEventListener('click', function () {
        response = {
          record: [
            { name: 'time', base: { float: parseFloat(properties.time) } },
            { name: 'point', base: { point: [parseFloat(properties.x), parseFloat(properties.y)] } }
          ]
        };
        dom.dispatchEvent(new CustomEvent('qti-interaction-changed', { bubbles: true, detail: { value: response } }));
      });

      dom.appendChild(button);
      dom.appendChild(output);

      var instance = {
        typeIdentifier: 'urn:fdc:qti-components:test:recordPci',
        getResponse: function () {
          return response;
        },
        getState: function () {
          return '';
        },
        setState: function () {},
        oncompleted: function () {}
      };
      config.onready(instance);
      return instance;
    }
  });
});
