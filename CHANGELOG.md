# Changelog

## [7.8.1](https://github.com/Citolab/qti-components/compare/v7.8.0...v7.8.1) (2025-09-18)


### Bug Fixes

* replace npm ci with npm install in CI workflows for consistency ([1669c96](https://github.com/Citolab/qti-components/commit/1669c9604e7091f5512dca93ece2446d05624b80))

## [7.8.0](https://github.com/Citolab/qti-components/compare/v7.7.0...v7.8.0) (2025-09-18)


### Features

* dispatch custom event when stamp context is updated ([#40](https://github.com/Citolab/qti-components/issues/40)) ([d3d92c0](https://github.com/Citolab/qti-components/commit/d3d92c07da86c237c3b2606a57b1412624039a53))


### Bug Fixes

* [[#35](https://github.com/Citolab/qti-components/issues/35)] drag interaction state styles ([#37](https://github.com/Citolab/qti-components/issues/37)) ([666d3af](https://github.com/Citolab/qti-components/commit/666d3afd2c047bc0a61a70caa77046bb2724e660))

## [7.7.0](https://github.com/Citolab/qti-components/compare/v7.6.0...v7.7.0) (2025-09-17)


### Features

* add workflows for publishing and deploying Storybook on release ([8c6d92e](https://github.com/Citolab/qti-components/commit/8c6d92e1a59519310cea3104bda87e2397e459da))


### Bug Fixes

* add caching for Playwright browsers to improve build efficiency ([834df59](https://github.com/Citolab/qti-components/commit/834df59c3b6749f4ed22614055e066b849ae09bc))
* add GitHub token to release step and increase fetch depth for checkout ([54310ae](https://github.com/Citolab/qti-components/commit/54310ae9ba7a53c610f2dac54c0fa2d6976c6703))
* add pull request permissions and ensure release job depends on build-and-test ([d9d85f5](https://github.com/Citolab/qti-components/commit/d9d85f5c7786df5c2774428272431a599fccba5a))
* add pull-requests permission for release-please to update release PRs ([41a2cd5](https://github.com/Citolab/qti-components/commit/41a2cd512ea78faf8d1174b19674b72b2c1008eb))
* improve release workflow by validating NPM publish before creating release ([e93e75b](https://github.com/Citolab/qti-components/commit/e93e75b25e2348de49edb8cb68ddba11e37a381e))
* remove --quiet flag from Playwright installation for better visibility ([82280ab](https://github.com/Citolab/qti-components/commit/82280abc98f364e0ebdcb86d086075304812ab82))
* remove push trigger from release workflow to allow manual dispatch only ([37ce1bd](https://github.com/Citolab/qti-components/commit/37ce1bd1e29c7eb97cc1aa93aa435625a909d1fb))
* remove push trigger from release workflow to streamline deployment process ([b125d80](https://github.com/Citolab/qti-components/commit/b125d80575ed138a74d80a82316a74cde4acbeb5))
* streamline NPM publication process and update release output handling ([b0d9587](https://github.com/Citolab/qti-components/commit/b0d95874d98a109a46dd05d66e444fd66e11fc75))
* update husky configuration ([62687d6](https://github.com/Citolab/qti-components/commit/62687d60a22e49ac494354d8b0d47ef9751ab43c))
* update pre-commit script to include commitlint ([0b7bd7d](https://github.com/Citolab/qti-components/commit/0b7bd7d6b5e27fbf53835ff9bddd910b2c224b9b))
* update release workflow to skip GitHub pull request creation ([7584eef](https://github.com/Citolab/qti-components/commit/7584eefaadc2d63b455aeb2025821e27c271ba18))
* update release workflow to use simple release type and remove build dependency ([25a38b8](https://github.com/Citolab/qti-components/commit/25a38b84bb8835a678011626b73f36d3fb619e28))
* update release workflow to validate NPM publish and improve release output handling ([27d2e0f](https://github.com/Citolab/qti-components/commit/27d2e0f6d89cd9b6b4bd8e4408e02d74774d0d63))
* update style for ScaledSmallerImageTest to include box-sizing property ([#33](https://github.com/Citolab/qti-components/issues/33)) ([b6bfdda](https://github.com/Citolab/qti-components/commit/b6bfdda7c3d562ee805ff7bbfda4943ed3f3f8ae))

## [7.6.1](https://github.com/Citolab/qti-components/compare/v7.6.0...v7.6.1) (2025-09-16)


### Bug Fixes

* add caching for Playwright browsers to improve build efficiency ([834df59](https://github.com/Citolab/qti-components/commit/834df59c3b6749f4ed22614055e066b849ae09bc))
* add GitHub token to release step and increase fetch depth for checkout ([54310ae](https://github.com/Citolab/qti-components/commit/54310ae9ba7a53c610f2dac54c0fa2d6976c6703))
* add pull request permissions and ensure release job depends on build-and-test ([d9d85f5](https://github.com/Citolab/qti-components/commit/d9d85f5c7786df5c2774428272431a599fccba5a))
* improve release workflow by validating NPM publish before creating release ([e93e75b](https://github.com/Citolab/qti-components/commit/e93e75b25e2348de49edb8cb68ddba11e37a381e))
* remove push trigger from release workflow to streamline deployment process ([b125d80](https://github.com/Citolab/qti-components/commit/b125d80575ed138a74d80a82316a74cde4acbeb5))
* streamline NPM publication process and update release output handling ([b0d9587](https://github.com/Citolab/qti-components/commit/b0d95874d98a109a46dd05d66e444fd66e11fc75))
* update husky configuration ([62687d6](https://github.com/Citolab/qti-components/commit/62687d60a22e49ac494354d8b0d47ef9751ab43c))
* update pre-commit script to include commitlint ([0b7bd7d](https://github.com/Citolab/qti-components/commit/0b7bd7d6b5e27fbf53835ff9bddd910b2c224b9b))
* update release workflow to use simple release type and remove build dependency ([25a38b8](https://github.com/Citolab/qti-components/commit/25a38b84bb8835a678011626b73f36d3fb619e28))
* update release workflow to validate NPM publish and improve release output handling ([27d2e0f](https://github.com/Citolab/qti-components/commit/27d2e0f6d89cd9b6b4bd8e4408e02d74774d0d63))
