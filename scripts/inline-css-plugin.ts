import { join } from 'path';
import postcss from 'postcss';
import postcssConfig from '../postcss.config.cjs';
import fs from 'fs';

export const InlineCSSPlugin = {
  name: 'inline-css',
  setup({ esbuild, onResolve, onLoad, initialOptions }) {
    onResolve({ filter: /\.css\?inline$/ }, args => ({
      namespace: 'inline',
      path: args.path,
      pluginData: { resolveDir: args.resolveDir }
    }));
    onLoad({ filter: /.*/, namespace: 'inline' }, async args => {
      try {
        // console.log('enter onLoad', args);
        const cssFullPath = join(args.pluginData.resolveDir, args.path.slice(0, -7));
        const cssContent = fs.readFileSync(cssFullPath, 'utf8');
        const processResult = await postcss((postcssConfig as any)?.plugins).process(cssContent, {
          from: cssFullPath,
          to: undefined
        });
        return { contents: processResult.content, loader: 'text' };
      } catch (err) {
        // err = { errors, warnings }
        return err;
      }
    });
  }
};
