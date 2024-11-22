import { customElementVsCodePlugin } from 'custom-element-vs-code-integration';
import { customEsLintRuleGeneratorPlugin } from 'custom-element-eslint-rule-generator';
import { customElementJsxPlugin } from 'custom-element-jsx-integration';

console.log('Building the custom element manifest...');

const outdir = './dist';

const options = {};

export default {
  globs: ['src/lib/qti-components/**/*.ts', 'src/lib/qti-item/**/*.ts'],
  exclude: ['src/**/qti-*.stories.ts', 'src/**/qti-*.test.ts', 'src/**/qti-*.spec.ts', 'src/**/qti-*.styles.ts'],
  outdir: outdir,
  litelement: true,
  plugins: [
    customElementVsCodePlugin({
      outdir: outdir
    }),
    customElementJsxPlugin({
      outdir: outdir,
      exclude: [],
      fileName: `qti-components-jsx.d.ts`
    }),
    customEsLintRuleGeneratorPlugin({
      outdir: outdir
    })
  ]
};

// {
//   name: 'qti-strip-attributes',
//   packageLinkPhase({ customElementsManifest }) {
//     customElementsManifest?.modules?.forEach(module => {
//       module?.declarations?.forEach(declaration => {
//         Object.keys(declaration).forEach(key => {
//           if (Array.isArray(declaration[key])) {
//             if (key == 'members') declaration[key] = [];
//             // declaration[key] = declaration[key].filter((member) => member.hasOwnProperty('attribute'));
//             declaration[key] = declaration[key].filter(member => !member.privacy?.includes('private'));
//             declaration[key] = declaration[key].filter(member => !member.privacy?.includes('protected'));
//             declaration[key] = declaration[key].filter(member => !member.name?.startsWith('_'));
//           }
//         });
//       });
//     });
//   }
// },
