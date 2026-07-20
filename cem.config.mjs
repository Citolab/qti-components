// import { customElementVsCodePlugin } from 'custom-element-vs-code-integration';
import { jsxTypesPlugin } from '@wc-toolkit/jsx-types';
import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';
import { cemSorterPlugin } from '@wc-toolkit/cem-sorter';
import { cemInheritancePlugin } from '@wc-toolkit/cem-inheritance';
import { cemValidatorPlugin } from '@wc-toolkit/cem-validator';

console.log('Building the custom element manifest...');

// Allow overriding outdir via environment variable or default to root
const outdir = process.env.CEM_OUTDIR || './';

/**
 * Keep CEM output deterministic.
 *
 * The base CEM analyzer removes empty class arrays (cssProperties/cssParts/
 * cssStates/slots/members/attributes/events), but `cemInheritancePlugin`
 * can re-create those arrays as empty during package link processing.
 * That causes noisy diffs where empty arrays sometimes appear/disappear.
 *
 * This plugin runs last and removes only empty arrays again so generated
 * manifests stay stable across runs.
 *
 * Remove this once upstream inheritance handling no longer re-introduces
 * empty arrays.
 */
function removeEmptyClassArraysPlugin() {
  const fields = ['cssProperties', 'cssParts', 'cssStates', 'slots', 'members', 'attributes', 'events'];

  return {
    name: 'local-remove-empty-class-arrays',
    packageLinkPhase({ customElementsManifest }) {
      for (const moduleDoc of customElementsManifest.modules || []) {
        for (const declaration of moduleDoc.declarations || []) {
          if (declaration.kind !== 'class' && declaration.kind !== 'mixin') {
            continue;
          }

          for (const field of fields) {
            if (Array.isArray(declaration[field]) && declaration[field].length === 0) {
              delete declaration[field];
            }
          }
        }
      }
    }
  };
}

export default {
  /** Globs to analyze */
  globs: [
    'packages/qti-base/src/**/*.ts',
    'packages/qti-item/src/components/**/*.ts',
    'packages/qti-test/src/components/**/*.ts',
    'packages/qti-elements/src/components/**/*.ts',
    'packages/interactions/*/src/**/*.ts',
    'packages/interactions/core/src/elements/**/*.ts',
    'packages/interactions/core/src/mixins/**/*.ts',
    'packages/qti-processing/src/components/**/*.ts'
  ],
  /** Globs to exclude */
  exclude: ['packages/**/*.stories.ts', 'packages/**/*.spec.ts', 'packages/**/*.styles.ts'],
  /** Directory to output CEM to */
  outdir: outdir,
  /** Run in dev mode, provides extra logging */
  dev: false,
  /** Run in watch mode, runs on file changes */
  watch: false,
  /** Include third party custom elements manifests */
  dependencies: false,
  /** Output CEM path to `package.json`, defaults to true */
  packagejson: false,
  /** Enable special handling for litelement */
  litelement: true,

  overrideModuleCreation: ({ ts, globs }) => {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    return program.getSourceFiles().filter(sf => globs.find(glob => sf.fileName.includes(glob)));
  },

  /** Custom elements manifest plugins */
  plugins: [
    typeParserPlugin({
      outdir: outdir + 'dist'
    }),
    cemInheritancePlugin({}),
    // customElementVsCodePlugin({
    //   outdir: outdir + 'dist'
    // }),
    jsxTypesPlugin({
      outdir: outdir + 'dist',
      exclude: [],
      fileName: `qti-components-jsx.d.ts`
    }),
    cemSorterPlugin({
      deprecatedLast: true
    }),
    cemValidatorPlugin({
      logErrors: true, // Log errors without stopping the build
      // exclude: ['BaseComponent', 'InternalMixin'], // Skip base classes

      rules: {
        // Override default severity levels for validation
        packageJson: {
          packageType: 'off',
          main: 'off',
          module: 'off',
          types: 'off',
          exports: 'off',
          customElementsProperty: 'off',
          publishedCem: 'off'
        },
        manifest: {
          schemaVersion: 'off',
          modulePath: 'off',
          definitionPath: 'off',
          typeDefinitionPath: 'off',
          exportTypes: 'off',
          tagName: 'off'
        }
      }
    }),
    removeEmptyClassArraysPlugin()
  ]
};
