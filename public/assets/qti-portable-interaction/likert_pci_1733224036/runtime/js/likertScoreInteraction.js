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
 * Copyright (c) 2017-2024 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'qtiCustomInteractionContext',
    'likertScoreInteraction/runtime/js/renderer',
    'taoQtiItem/portableLib/OAT/util/event'
], function(qtiCustomInteractionContext, renderer, event){
    'use strict';

    const _typeIdentifier = 'likertScoreInteraction';

    function likertInteractionFactory() {
        return {

            /*********************************
             *
             * IMS specific PCI API property and methods
             *
             *********************************/

            typeIdentifier: _typeIdentifier,

            /*********************************
             *
             * TAO and IMS shared PCI API methods
             *
             *********************************/

            /**
             * Get the response in the json format described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             *
             * @param {Object} interaction
             * @returns {Object}
             */
            getResponse: function() {
                const checkedInput = this.dom.querySelector('input:checked');
                const value = (checkedInput && parseInt(checkedInput.value)) || 0;

                return { base: { integer: value } };
            },
            /**
             * Reverse operation performed by render()
             * After this function is executed, only the inital naked markup remains
             * Event listeners are removed and the state and the response are reset
             *
             * @param {Object} interaction
             */
            destroy: function() {
                this.dom.innerHTML = '';
            },


            /*********************************
             *
             * TAO specific PCI API methods
             *
             *********************************/

            /**
             * Get the type identifier of a pci
              * @returns {string}
             */
            getTypeIdentifier: function() {
                return _typeIdentifier;
            },

            /**
             * Render the PCI :
             * @param {String} id - responseIdentifier
             * @param {Node} dom - container provided by host
             * @param {Object} properties (PCI's config.properties)
             */
            initialize: function(id, dom, properties) {
                this.dom = dom;
                this.properties = properties || {};

                renderer.render(id, this.dom, this.properties);
            },

            /**
             * Programmatically set the response following the json schema described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             *
             * @param {Object} interaction
             * @param {Object} response
             */
            setResponse: function(response) {
                const value = response && response.base ? parseInt(response.base.integer) : -1;
                const input = this.dom.querySelector(`input[value="${value}"]`);
                if (input) {
                    input.setAttribute('checked', true);
                }
            },

            /**
             * Remove the current response set in the interaction
             * The state may not be restored at this point.
             *
             * @param {Object} interaction
             */
            resetResponse: function() {
                this.dom.querySelector('input:checked').setAttribute('checked', false);
            },

            /**
             * Restore the state of the interaction from the serializedState.
             *
             * @param {Object} interaction
             * @param {Object} serializedState - json format
             */
            setSerializedState: function(state) {
                if(state && state.response) {
                    this.setResponse(state.response);
                }
            },

            /**
             * Get the current state of the interaction as a string.
             * It enables saving the state for later usage.
             *
             * @param {Object} interaction
             * @returns {Object} json format
             */
            getSerializedState: function() {
                return { response : this.getResponse() };
            }
        }
    };

    qtiCustomInteractionContext.register({
        typeIdentifier: _typeIdentifier,

        /**
         * initialize the PCI object. As this object is cloned for each instance, using "this" is safe practice.
         * @param {DOMElement} dom - the dom element the PCI can use
         * @param {Object} config - the standard configuration object
         * @param {Object} [state] - the json serialized state object, returned by previous call to getState()
         */
        getInstance(dom, config, state) {
            const likertInteraction = likertInteractionFactory();

            // create a IMS PCI instance object that will be provided in onready
            const pciInstance = {
                getResponse() {
                    return likertInteraction.getResponse();
                },

                /**
                 * Get the current state of the PCI
                 * @returns {Object}
                 */
                getState() {
                    return likertInteraction.getSerializedState();
                },

                /**
                 * Called by delivery engine when PCI is fully completed
                 */
                oncompleted() {
                    likertInteraction.destroy();
                }
            };

            // event manager is necessary only for creator part
            event.addEventMgr(pciInstance);

            const boundTo = config.boundTo;
            const responseIdentifier = Object.keys(boundTo)[0];
            let response = boundTo[responseIdentifier];

            // initialize and set previous response/state
            likertInteraction.initialize(responseIdentifier, dom, config.properties);
            likertInteraction.setResponse(response);
            likertInteraction.setSerializedState(state);

            pciInstance.on('configChange', newProperties => {
                Object.assign(likertInteraction.properties, newProperties);
                renderer.render(responseIdentifier, dom, likertInteraction.properties);
            });

            // PCI instance is ready to run
            config.onready(pciInstance);

            likertInteraction.pciInstance = pciInstance;
        }
    });
});
