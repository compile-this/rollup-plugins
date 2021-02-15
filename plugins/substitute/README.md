# @compile-this/rollup-plugin-substitute

A Rollup plugin for generating an asset based on a template and dynamic token replacement.

## Requirements

This plugin requires an [LTS](https://github.com/nodejs/Release) Node version (v14.0.0+) and Rollup v2.39.0+.

## Install

``` bash
# npm
npm install --save-dev @compile-this/rollup-plugin-substitute

# pnpm
pnpm add --save-dev @compile-this/rollup-plugin-substitute

# yarn
yarn add --dev @compile-this/rollup-plugin-substitute
```

## Why?

Because sometimes you have assets which need to include information only available during the bundling process:

- The file paths/names of entry and manual chunks emitted by Rollup.
- Values calculated as part of your Rollup configuration.

## Usage

Create a Rollup [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
// rollup.config.js

import { substitute } from '@compile-this/rollup-plugin-substitute';

export default {
  input: {
    'scripts/index': './src/index.jsx',
  }

  output: {
    dir: './dist',
    format: 'cjs',

    manualChunks: {
      'scripts/vendor/react': [ 'react' ],
      'scripts/vendor/react-dom': [ 'react-dom' ],
    }
  },

  plugins: [
    substitute({
      sourceFile: './assets/index.html', // template file to process
      targetDir: '.',                    // output location relative to output.dir
      tokens: {
        static: {                        // static tokens (calculated when configuring the plugin)
          version: '1.0.0',
          built: (new Date()).toISOString()
        }
      }
    })
  ],
};
```

``` html
<!-- assets/index.html -->

<!doctype html>

<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Horizon</title>
    <meta name="version" content="${{static:version}}" />
    <meta name="built" content="${{static:built}}" />
  </head>

  <body>
    <script src="${{chunk:scripts/vendor/react}}"></script>
    <script src="${{chunk:scripts/vendor/react-dom}}"></script>

    <script src="${{chunk:scripts/index}}"></script>
  </body>
</html>
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Options

### `sourceFile`

Type: `String`

Default: `<required>`

A template file, relative to the project root, to transform.

## Templates & Tokens

Template files contain tokens in the format `${{<type>:<name>}}` where `<type>` is the type of the token and `<name>` is the name of the token. For example, `${{static:version}}`.

| Type | Name | Example Token | Example Output |
| :-- | :-- | :-- | :-- |
| `chunk` | The name of a manual or entry chunk. | `${{chunk:scripts/index}}` | `./scripts/index.js` |
| `static` | The name of a static token defined in the plugin's options. | `${{static:built}}` | `2021-02-15T16:25:53.433Z` |

## Meta

[LICENSE (MIT)](/LICENSE)
