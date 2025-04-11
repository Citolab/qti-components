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
 * Copyright (c) 2016-2024 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'likertScoreInteraction/runtime/js/assets',
    'css!likertScoreInteraction/runtime/css/likertScoreInteraction'
], function(assets) {
    'use strict';

    function renderChoices(id, container, config) {
        const rootElt = container.querySelector('.likertScoreInteraction');
        const ul = rootElt && rootElt.querySelector('ul.likert');

        if (!rootElt || !ul) {
            throw new Error('LikertScoreInteraction: cannot render choices, markup elements not found');
        }

        const disabled = rootElt.classList.contains('tao-qti-creator-context');

        if (config.numbers) {
            rootElt.classList.add('numbers-above');
        } else {
            rootElt.classList.remove('numbers-above');
        }

        //ensure that renderChoices() is idempotent
        ul.innerHTML = '';

        // add levels
        const level = parseInt(config.level) || 5;
        for (let i = 1; i <= level; i++) {
            const li = document.createElement('li');
            const input = document.createElement('input');
            input.setAttribute('type', 'radio');
            input.setAttribute('name', id);
            input.setAttribute('value', i);
            if (disabled) {
                input.setAttribute('disabled', 'disabled');
            }

            li.append(input);
            ul.append(li);
        }
    }

    function renderLabels(container, config) {
        const div = container.querySelector('div.scale');
        const ul = div && div.querySelector('ul.likert');

        if (!div || !ul) {
            throw new Error('LikertScoreInteraction: cannot render labels, markup elements not found');
        }

        // texts
        let labelMin = div.querySelector('.likert-label-min');
        if (!labelMin) {
            labelMin = document.createElement('span');
            labelMin.classList.add('likert-label', 'likert-label-min');
            labelMin.innerHTML = config['label-min'];
        }

        let labelMax = div.querySelector('.likert-label-max');
        if (!labelMax) {
            labelMax = document.createElement('span');
            labelMax.classList.add('likert-label', 'likert-label-max');
            labelMax.innerHTML = config['label-max'];
        }

        // icons
        const parseSvgString = svgString => new DOMParser().parseFromString(svgString, 'image/svg+xml').querySelector('svg');
        const iconMin = parseSvgString(assets.thumbDown);
        const iconMax = parseSvgString(assets.thumbUp);

        let newChildren;
        div.innerHTML = '';
        if (config.icons) {
            newChildren = [labelMin, iconMin, ul, iconMax, labelMax];
        } else {
            newChildren = [labelMin, ul, labelMax];
        }
        for (const child of newChildren) {
            div.append(child);
        }
    }

    return {
        render(id, container, config) {
            renderChoices(id, container, config);
            renderLabels(container, config);
        },
        renderChoices,
        renderLabels
    };
});
