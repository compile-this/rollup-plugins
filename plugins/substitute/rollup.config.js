import { builtinModules as builtin } from 'module';

import typescript from '@wessberg/rollup-plugin-ts';

export default {
  input: {
    'index': 'src/index.ts',
  },

  external: [ ...builtin ],

  output: {
    dir: './dist',
    format: 'es',
    sourcemap: true,
    entryFileNames: '[name].mjs',
    chunkFileNames: '[name]-[hash].mjs',
  },

  plugins: [
    typescript(),
  ]
};