# @citolab/qti-components

<a href="https://www.repostatus.org/#wip"><img src="https://www.repostatus.org/badges/latest/wip.svg" alt="Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public." /></a>

[![npm version](https://badge.fury.io/js/%40citolab%2Fqti-components.svg)](https://badge.fury.io/js/%40citolab%2Fqti-components)
[![License](https://img.shields.io/badge/license-GPL-blue.svg)](https://opensource.org/license/gpl-2-0/)

@citolab/qti-components is a web component library that can be used to render 1EdTech QTI items.
It's highly customizable and can be integrated in almost every web application.

## Installation

### CDN

Import the components with the CDN version

```html
<script type="module">
  import 'https://unpkg.com/@citolab/qti-components/cdn';
</script>
```

### NPM

Or use npm to install the package:

```shell
npm install @citolab/qti-components
```

To use @citolab/qti-components, you need to register the web components. By registering the web components, the browser knows how to display the item and create a fully functional test.

```javascript
import '@citolab/qti-components';
```

## Storybook

Explore the complete description of supported QTI tags, examples, and the ability to interactively play with changing attributes of the QTI items in our [Storybook](https://qti-components.citolab.nl/).

## Contributing

Contributions are welcome! Please follow these guidelines when contributing:

- Fork the repository and clone it to your local machine
- Create a new branch for your feature or bug fix
- Commit your changes with clear and concise messages
- Push your changes to your forked repository
- Open a pull request to the original repository

## Third-Party Components

Note: This repository includes some third-party components solely for showcasing PCIs in Storybook. These components are not included in the published npm package. For licensing details, refer to the LICENSE file in the third-party directory.

## License

This project is licensed under the [GPLv3 License](LICENSE).

Please note that the licensing is GPLv3 if you want to use it in another way, feel free to ask!
