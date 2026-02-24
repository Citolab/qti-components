import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';
import { cemSorterPlugin } from '@wc-toolkit/cem-sorter';
import { cemInheritancePlugin } from '@wc-toolkit/cem-inheritance';
import { cemValidatorPlugin } from '@wc-toolkit/cem-validator';

console.log('Building the custom element manifest...');

// Allow overriding outdir via environment variable or default to root
const outdir = process.env.CEM_OUTDIR || './';

export default {
  /** Globs to analyze */
  globs: ['src/components/**/*.ts', 'src/elements/**/*.ts'],
  /** Globs to exclude */
  exclude: [
    'src/components/**/*.stories.ts',
    'src/components/**/*.spec.ts',
    'src/components/**/*.styles.ts',
    'src/components/**/*.commands.ts',
    'src/components/**/*.keymap.ts',
    'src/components/**/*.schema.ts'
  ],
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

  overrideModuleCreation({ ts, globs }) {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    return program.getSourceFiles().filter(sf => globs.find(glob => sf.fileName.includes(glob)));
  },

  /** Custom elements manifest plugins */
  plugins: [
    typeParserPlugin(),
    cemInheritancePlugin({}),
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
