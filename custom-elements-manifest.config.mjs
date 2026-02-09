// import { customElementVsCodePlugin } from 'custom-element-vs-code-integration';
import { jsxTypesPlugin } from '@wc-toolkit/jsx-types';
import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';
import { cemSorterPlugin } from '@wc-toolkit/cem-sorter';
import { cemInheritancePlugin } from '@wc-toolkit/cem-inheritance';
import { cemValidatorPlugin } from '@wc-toolkit/cem-validator';

console.log('Building the custom element manifest...');

// Allow overriding outdir via environment variable or default to root
const outdir = process.env.CEM_OUTDIR || './';

export default {
  /** Globs to analyze */
  globs: [
    'packages/qti-base/src/**/*.ts',
    'packages/qti-item/src/components/**/*.ts',
    'packages/qti-test/src/components/**/*.ts',
    'packages/qti-elements/src/components/**/*.ts',
    'packages/qti-interactions/src/components/**/*.ts',
    'packages/qti-interactions/src/mixins/**/*.ts',
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
    })
  ]
};
