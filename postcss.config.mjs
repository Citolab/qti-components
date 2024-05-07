import UnoCSS from '@unocss/postcss'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'

export default {
  plugins: [
    UnoCSS,
    postcssImport,
    autoprefixer,
  ],
}
