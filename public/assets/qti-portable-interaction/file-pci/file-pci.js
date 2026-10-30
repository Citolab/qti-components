/*
 * A minimal PCI bound to a response with base-type file, for tests.
 *
 * Clicking "Answer" reports a fixed text file ("hello world") as QTI Appendix C JSON through a
 * qti-interaction-changed event:
 *   { base: { file: { data: 'aGVsbG8gd29ybGQ=', mime: 'text/plain', name: 'hello.txt' } } }
 * It shows the boundTo it was constructed with, so a restored file can be checked.
 */
define(['qtiCustomInteractionContext'], function (ctx) {
  'use strict';

  ctx.register({
    typeIdentifier: 'urn:fdc:qti-components:test:filePci',
    getInstance: function (dom, config) {
      var response = (config.boundTo && config.boundTo[config.responseIdentifier]) || undefined;

      var output = document.createElement('pre');
      output.setAttribute('data-testid', 'bound-to');
      output.textContent = JSON.stringify(response || null);

      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Answer';
      button.addEventListener('click', function () {
        response = { base: { file: { data: 'aGVsbG8gd29ybGQ=', mime: 'text/plain', name: 'hello.txt' } } };
        dom.dispatchEvent(new CustomEvent('qti-interaction-changed', { bubbles: true, detail: { value: response } }));
      });

      dom.appendChild(button);
      dom.appendChild(output);

      var instance = {
        typeIdentifier: 'urn:fdc:qti-components:test:filePci',
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
