import { resolve, parse, join } from 'path';
import { readFile, stat } from 'fs/promises';

import { EmittedAsset, OutputBundle, Plugin } from 'rollup';

export interface SubstitutePluginOptions {
  sourceFile: string;
  targetDir?: string;
  targetFileName?: string;
  tokens?: SubstitutePluginTokenOptions;
}

export interface SubstitutePluginTokenOptions {
  static?: Record<string, string>;
}

export function substitute(options: SubstitutePluginOptions) : Plugin {
  const staticTokens = options.tokens?.static || {};

  return {
    name: 'substitute',

    async generateBundle(output, bundle) {
      const root = process.cwd();
      const tokens = new Tokens(bundle, staticTokens);

      if (!output.dir) {
        this.error('output.dir must be defined to use this plugin.');
      }

      const source = resolve(root, options.sourceFile);
      const target = join(options.targetDir || '', options.targetFileName ? options.targetFileName : parse(source).base);
      
      if (!(await stat(source)).isFile) {
        this.error(`source (${options.sourceFile}) must be a file.`);
      }

      const replacer = createReplacer(tokens);
      const content =  (await loadFileAsString(source)).replace(tokenMatcher, replacer);

      const result: EmittedAsset = {
        type: 'asset',
        source: content,
        name: target,
        fileName: target
      };

      this.emitFile(result);
    }
  };
}

async function loadFileAsString(name: string) : Promise<string> {
  const path = resolve(name);
  const contents = await readFile(path, { encoding: 'utf-8' });

  return contents;
}

function createReplacer(tokens: Tokens) : ((match: string, ...args: string[]) => string) {
  return (match: string, type: TokenType, name: string) : string => {
    const token = tokens.resolveToken(type, name);

    if (!token) {
      throw new Error(`Token { type: '${type}', name: '${name}' } is not defined.`);
    }

    return token;
  };
}

enum TokenType {
    ASSET = 'asset',
    CHUNK = 'chunk',
    STATIC = 'static'
}

class Tokens {
  #chunks: Record<string, string>;
  #assets: Record<string, string>;
  #statics: Record<string, string>;

  constructor(bundle: OutputBundle, statics: Record<string, string>) {
    this.#chunks = {};
    this.#assets = {};
    this.#statics = statics;

    Object.values(bundle).forEach(entry => {
      if (entry.name) {
        switch (entry.type) {
        case 'asset':
          this.#assets[entry.name] = entry.fileName;
          break;

        case 'chunk':
          this.#chunks[entry.name] = entry.fileName;
          break;
        }
      }
    });
  } 

  resolveToken(type: TokenType, name: string) : string | undefined {
    switch (type) {
    case TokenType.ASSET:
      return this.resolveAssetToken(name);

    case TokenType.CHUNK:
      return this.resolveChunkToken(name);

    case TokenType.STATIC:
      return this.resolveStaticToken(name);
    }
  }

  resolveAssetToken(name: string) : string | undefined {
    return makeRooted(this.#assets[name]);
  }

  resolveChunkToken(name: string) : string | undefined {
    return makeRooted(this.#chunks[name]);
  }

  resolveStaticToken(name: string) : string | undefined {
    return this.#statics[name];
  }
}

function makeRooted(path: string) {
  if (path.length > 0) {
    if (![ '/', '.' ].includes(path[0])) {
      return `./${path}`;
    }
  }

  return path;
}

const tokenMatcher = /\$\{\{(asset|chunk|static):(.+?)\}\}/gi;
