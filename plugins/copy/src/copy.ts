import { relative, parse, join, resolve } from 'path';
import { readFile } from 'fs/promises';

import globby from 'globby';

import { EmittedAsset, Plugin } from 'rollup';

export interface CopyPluginOptions {
  root: string;
  targets: CopyPluginTargetOptions[];
}

export interface CopyPluginTargetOptions {
  src: string;
  dest?: string;
}

export function copy(options: CopyPluginOptions) : Plugin {
  return {
    name: 'copy',

    async generateBundle() {
      const root = resolve(process.cwd(), options.root || '');

      const assets = await resolveTargets(options.targets, root);
      assets.forEach(asset => this.emitFile(asset));
    }
  };
}

async function resolveTargets(targets: CopyPluginTargetOptions[], root: string) : Promise<EmittedAsset[]> {
  const resolvers = targets.map(target => resolveTarget(target, root));
  const results = await Promise.all(resolvers);

  return results.flat();
}

async function resolveTarget(target: CopyPluginTargetOptions, root: string) : Promise<EmittedAsset[]> {
  const paths = await globby(target.src, { cwd: root, absolute: true });
  const dest = target.dest || '';
  const resolvers = paths.map(path => resolveAsset(path, root, dest));
  
  return await Promise.all(resolvers);
}

async function resolveAsset(path: string, root: string, dest: string) : Promise<EmittedAsset> {
  const destinationPath = join(dest, relative(root, path));
  const content = await readFile(path, { encoding: 'utf-8' });

  return {
    type: 'asset',
    source: content,
    name: parse(destinationPath).base,
    fileName: destinationPath
  };
}


