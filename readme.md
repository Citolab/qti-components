# @citolab/qti-components

<a href="https://www.repostatus.org/#wip"><img src="https://www.repostatus.org/badges/latest/wip.svg" alt="Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public." /></a>

[![npm version](https://badge.fury.io/js/%40citolab%2Fqti-components.svg)](https://badge.fury.io/js/%40citolab%2Fqti-components)
[![License](https://img.shields.io/badge/license-GPL-blue.svg)](https://opensource.org/license/gpl-2-0/)

@citolab/qti-components is a web component library that can be used to render 1EdTech QTI items.
It's highly customizable and can be integrated in almost every web application.

## Installation

Use npm to install the package:

```shell
npm install @citolab/qti-components
```

## Usage

To use @citolab/qti-components, you need to register the web components and import the required CSS file. By registering the web components, the browser knows how to display the item and create a fully functional item.

Here's a basic example:

```javascript
import * as QTI from 'https://unpkg.com/@citolab/qti-components@latest/dist/index.js';
```

```css
@import 'https://unpkg.com/@citolab/qti-components@latest/dist/index.css';'
```

```html
<qti-assessment-item identifier="choice" title="Unattended Luggage" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>ChoiceA</qti-value>
    </qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-item-body>
    <p>Look at the text in the picture.</p>
    <p>
      <img src="images/sign.png" alt="NEVER LEAVE LUGGAGE UNATTENDED" />
    </p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-prompt>What does it say?</qti-prompt>
      <qti-simple-choice identifier="ChoiceA">You must stay with your luggage at all times.</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceB">Do not let someone else look after your luggage.</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceC">Remember your luggage when you leave.</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml" />
</qti-assessment-item>
```

You can see a working example here [JSFiddle](https://jsfiddle.net/mrklein/s97Ld0gn).

## Storybook

Explore the complete description of supported QTI tags, examples, and the ability to interactively play with changing attributes of the QTI items in our [Storybook](https://qti-components.citolab.nl/).

## Contributing

Contributions are welcome! Please follow these guidelines when contributing:

- Fork the repository and clone it to your local machine
- Create a new branch for your feature or bug fix
- Commit your changes with clear and concise messages
- Push your changes to your forked repository
- Open a pull request to the original repository

## License

This project is licensed under the [GPLv3 License](LICENSE).

Please note that the licensing is GPLv3 if you want to use it in another way, feel free to ask!

```

```
