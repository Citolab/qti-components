/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2020 DEPP, Ministère de l'Education Nationale;
 * Developed by Saskia Keskpaik (DEPP)
 */
define(['qtiCustomInteractionContext', 'IMSGlobal/jquery_2_1_1', 'decisiontask/runtime/js/renderer', 'OAT/util/event'], function (
  qtiCustomInteractionContext,
  $,
  renderer,
  event
) {
  'use strict';

  var decisiontask = {
    id: -1,
    getTypeIdentifier: function () {
      return 'decisiontask';
    },
    /**
     * Render the PCI :
     * @param {String} id
     * @param {Node} dom
     * @param {Object} config - json
     */
    initialize: function (id, dom, config, assetManager) {
      //add method on(), off() and trigger() to the current object
      event.addEventMgr(this);

      var _this = this;
      this.id = id;
      this.dom = dom;
      this.config = config || {};
      this.responseContainer = { base: { string: '' } };
      this.timer = { id: '', timeinterval: null };

      renderer.render(this.id, this.dom, this.config, this.responseContainer, assetManager, this.timer);

      //tell the rendering engine that I am ready
      qtiCustomInteractionContext.notifyReady(this);

      //listening to dynamic configuration change
      this.on('csvImporterChange', function (jsonData, fname) {
        _this.config.data = jsonData;
        _this.config.uploadedFname = fname;
        renderer.renderItem(_this.id, _this.dom, _this.config, _this.responseContainer, assetManager, _this.timer);
      });

      this.on('feedbackChange', function (feedback) {
        _this.config.feedback = feedback;
        renderer.renderItem(_this.id, _this.dom, _this.config, _this.responseContainer, assetManager, _this.timer);
      });

      this.on('shufflestimuliChange', function (shufflestimuli) {
        _this.config.shufflestimuli = shufflestimuli;
        renderer.renderItem(_this.id, _this.dom, _this.config, _this.responseContainer, assetManager, _this.timer);
      });

      this.on('respkeyChange', function (respkey) {
        _this.config.respkey = respkey;
        renderer.renderItem(_this.id, _this.dom, _this.config, _this.responseContainer, assetManager, _this.timer);
      });

      this.on('tlimitChange', function (tlimit) {
        _this.config.tlimit = tlimit;
        renderer.renderItem(_this.id, _this.dom, _this.config, _this.responseContainer, assetManager, _this.timer);
      });

      this.on('levelChange', function (level) {
        _this.config.level = level;
        renderer.renderItem(_this.id, _this.dom, _this.config, _this.responseContainer, assetManager, _this.timer);
      });

      this.on('btnLabel0Change', function (buttonlabel0) {
        _this.config.buttonlabel0 = buttonlabel0;
        renderer.renderBtnlabel0(_this.id, _this.dom, _this.config);
      });

      this.on('btnLabel1Change', function (buttonlabel1) {
        _this.config.buttonlabel1 = buttonlabel1;
        renderer.renderBtnlabel1(_this.id, _this.dom, _this.config);
      });

      this.on('btnLabel2Change', function (buttonlabel2) {
        _this.config.buttonlabel2 = buttonlabel2;
        renderer.renderBtnlabel2(_this.id, _this.dom, _this.config);
      });

      this.on('btnLabel3Change', function (buttonlabel3) {
        _this.config.buttonlabel3 = buttonlabel3;
        renderer.renderBtnlabel3(_this.id, _this.dom, _this.config);
      });

      this.on('btnLabel4Change', function (buttonlabel4) {
        _this.config.buttonlabel4 = buttonlabel4;
        renderer.renderBtnlabel4(_this.id, _this.dom, _this.config);
      });

      this.on('btnLabel5Change', function (buttonlabel5) {
        _this.config.buttonlabel5 = buttonlabel5;
        renderer.renderBtnlabel5(_this.id, _this.dom, _this.config);
      });

      this.on('btnLabel6Change', function (buttonlabel6) {
        _this.config.buttonlabel6 = buttonlabel6;
        renderer.renderBtnlabel6(_this.id, _this.dom, _this.config);
      });

      this.on('btnLabel7Change', function (buttonlabel7) {
        _this.config.buttonlabel7 = buttonlabel7;
        renderer.renderBtnlabel7(_this.id, _this.dom, _this.config);
      });

      $(this.dom).on('pcidone', function () {
        _this.trigger('responseChange', _this.getResponse());
      });
    },
    /**
     * Programmatically set the response following the json schema described in
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * @param {Object} interaction
     * @param {Object} response
     */
    setResponse: function (response) {
      var $container = $(this.dom),
        value;
    },
    /**
     * Get the response in the json format described in
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * @param {Object} interaction
     * @returns {Object}
     */
    getResponse: function () {
      return this.responseContainer;
    },
    /**
     * Remove the current response set in the interaction
     * The state may not be restored at this point.
     *
     * @param {Object} interaction
     */
    resetResponse: function () {
      var $container = $(this.dom);
    },
    /**
     * Reverse operation performed by render()
     * After this function is executed, only the inital naked markup remains
     * Event listeners are removed and the state and the response are reset
     *
     * @param {Object} interaction
     */
    destroy: function () {
      var $container = $(this.dom);
      $container.off().empty();
      clearInterval(this.timer.timeinterval);
    },
    /**
     * Restore the state of the interaction from the serializedState.
     *
     * @param {Object} interaction
     * @param {Object} serializedState - json format
     */
    setSerializedState: function (state) {},
    /**
     * Get the current state of the interaction as a string.
     * It enables saving the state for later usage.
     *
     * @param {Object} interaction
     * @returns {Object} json format
     */
    getSerializedState: function () {
      return {};
    }
  };

  qtiCustomInteractionContext.register(decisiontask);
});
