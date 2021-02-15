import { Plugin } from 'rollup';

export function clean() : Plugin {
  return {
    name: 'clean',

    async buildStart() {
      // do nothing.
    }
  };
}
