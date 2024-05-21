// uno.config.ts
// import presetUno from '@unocss/preset-uno';
// import presetWind from '@unocss/preset-wind';
import presetMini from '@unocss/preset-mini';
import transformerDirectives from '@unocss/transformer-directives';

import { defineConfig } from 'unocss';

export default defineConfig({
  // content: {
  //   filesystem: ['**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}']
  // },
  // variants: [
  //   // hover:
  //   matcher => {
  //     if (!matcher.startsWith('part:')) return matcher;
  //     return {
  //       // slice `part:` prefix and passed to the next variants and rules
  //       matcher: matcher.slice(5),
  //       selector: s => `${s}:part`
  //     };
  //   }
  // ],
  theme: {
    // ...
    colors: {
      primary: '#0000ff',
      focus: '#00ff00'
    }
  },
  transformers: [transformerDirectives()],
  presets: [presetMini({ preflight: false, variablePrefix: 'qti-' })], // , prefix: 'qti-'
  rules: [
    [
      'chevron',
      {
        background: `url("data:image/svg+xml,%3Csvg fill='currentColor' width='22' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'%3E%3Cpath clip-rule='evenodd' fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'%3E%3C/path%3E%3C/svg%3E") no-repeat center right 6px`
      }
    ],
    [
      'handle',
      {
        'background-image': `
        radial-gradient(circle at center, rgba(0, 0, 0, 0.1) 0, rgb(0, 0, 0, 0.1) 2px, white 2px, white 100%);
        background-repeat: repeat-y;
        background-position: left 2px;
        background-size: 14px 8px;`
      }
    ],
    [
      'check-mask',
      {
        '-webkit-mask': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' width='100%' height='100%' viewBox='0 0 24 24'%3E%3Cpath d='M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z'/%3E%3C/svg%3E")`
      }
    ]
  ],
  shortcuts: {
    bordered: `border-2 border-solid border-gray-400 outline-none`,
    borderinvisible: `border-transparent`,
    form: `    bordered flex w-5 h-5 shrink-0 items-center justify-center border-2 `,
    'p-lg': 'py-2 pl-4 pr-3',
    /* interaction elements, choose one */
    button: `  bordered rounded-md cursor-pointer px-3 py-2 font-semibold`,
    select: `  bordered rounded-md relative appearance-none px-3 py-2 pr-7 chevron`,
    text: `    bordered rounded-none cursor-text p-3`,
    spot: `    bordered h-full w-full bg-transparent p-0  `,
    point: `   bordered h-6 w-6 bg-transparent p-0  `,
    drag: `    bordered p-lg rounded-md inline-block cursor-grab bg-white font-semibold handle`,
    drop: `    bordered rounded-lg border-solid relative bg-gray-50 m-px`,
    order: `   bg-primary rounded-full h-6 w-6  text-white`,
    check: `   flex items-center gap-2 px-1 py-0.5 outline-none rounded-md`,
    'check-radio': `form rounded-full`,
    'check-radio-checked': `bg-primary rounded-full`,
    'check-checkbox': `form rounded`,
    'check-checkbox-checked': `bg-primary check-mask`,
    /* states, choose multiple */
    hov: `     bg-gray-50`,
    foc: `     outline-focus outline-2`,
    act: `     border-primary`,
    rdo: `     cursor-pointer bg-white outline-0 border-0`,
    dis: `     cursor-not-allowed bg-gray-100 text-gray-500 border-gray-400`
  }
});
