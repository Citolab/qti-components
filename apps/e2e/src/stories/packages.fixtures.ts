/**
 * The packages the package browsers (QTI Item › Examples, QTI Test › Examples) can load, each by its
 * manifest. The name is what the radio control shows. A package must have an `imsmanifest.xml`: the
 * browsers find the test and its items through it.
 */
export const EXAMPLES_PACKAGE = '/assets/api/examples/imsmanifest.xml';
export const SHOWCASE_PACKAGE = '/assets/tests/showcase/imsmanifest.xml';
export const KENNISNET_PACKAGE = '/assets/api/kennisnet/imsmanifest.xml';
export const BIOLOGIE_PACKAGE = '/assets/api/biologie/imsmanifest.xml';

export const PACKAGES = {
  showcase: SHOWCASE_PACKAGE,
  examples: EXAMPLES_PACKAGE,
  kennisnet: KENNISNET_PACKAGE,
  biologie: BIOLOGIE_PACKAGE
} as const;

export type PackageName = keyof typeof PACKAGES;
export const PACKAGE_NAMES = Object.keys(PACKAGES) as PackageName[];
