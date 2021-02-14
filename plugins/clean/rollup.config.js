import typescript from '@wessberg/rollup-plugin-ts'

export default {
  input: {
    'index': 'src/index.ts',
  },

  //external: [ 'react', 'react-dom' ],

  output: {
    dir: './dist',
    format: 'es',
    sourcemap: true,
  },

  plugins: [
    typescript(),
  ]
};