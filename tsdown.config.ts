import { defineConfig } from 'tsdown'
import { clientConfig } from './build/tsdown.client.ts'

export default defineConfig([
  {
    name: '@dsh-external/dsh-ui-switcher',
    entry: ['src/index.ts'],
    outDir: 'lib',
    format: 'esm',
    platform: 'node',
    target: 'es2022',
    fixedExtension: false,
    dts: false,
    clean: true,
    external: [/^@deepseek-ai\//],
  },
  clientConfig,
])
