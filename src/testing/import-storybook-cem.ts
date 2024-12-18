/*
Use of https://github.com/break-stuff/wc-storybook-helpers requires storybook.
To circumvent this, we can use the following code to import the custom elements manifest.
*/

import customElementsManifest from '../../custom-elements.json';
window['__STORYBOOK_CUSTOM_ELEMENTS_MANIFEST__'] = customElementsManifest;
