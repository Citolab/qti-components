import { customElementVsCodePlugin } from 'custom-element-vs-code-integration';
import { jsxTypesPlugin } from '@wc-toolkit/jsx-types';
import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';
import { cemSorterPlugin } from '@wc-toolkit/cem-sorter';

console.log('Building the custom element manifest...');

const outdir = './';

export default {
  /** Globs to analyze */
  globs: [
    'packages/qti-components/src/**/*.ts',
    'packages/qti-item/src/**/*.ts',
    'packages/qti-test/src/**/*.ts',
    'packages/qti-elements/src/**/*.ts',
    'packages/qti-interactions/**/*.ts'
  ],
  /** Globs to exclude */
  exclude: ['packages/**/qti-*.stories.ts', 'packages/**/qti-*.spec.ts', 'packages/**/qti-*.styles.ts'],
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
    customElementVsCodePlugin({
      outdir: outdir + 'dist'
    }),
    jsxTypesPlugin({
      outdir: outdir + 'dist',
      exclude: [],
      fileName: `qti-components-jsx.d.ts`
    }),
    cemSorterPlugin({
      deprecatedLast: true
    })
  ]
};
