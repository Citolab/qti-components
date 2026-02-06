import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';
import { cemSorterPlugin } from '@wc-toolkit/cem-sorter';
import { cemInheritancePlugin } from '@wc-toolkit/cem-inheritance';

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
    })
  ]
};
