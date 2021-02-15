import { builtinModules as builtin } from 'module';

import typescript from '@wessberg/rollup-plugin-ts';

export default {
  input: {
    'index': 'src/index.ts',
  },

  external: [ ...builtin ],

  output: [
    {
      dir: './dist/esm',
      format: 'esm',
      sourcemap: true,
      entryFileNames: '[name].mjs',
      chunkFileNames: '[name]-[hash].mjs',
    },

    {
      dir: './dist/cjs',
      format: 'cjs',
      sourcemap: true,
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name]-[hash].cjs',
    }
  ],

  plugins: [
    typescript(),
  ]
};