import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import pkg from './package.json';

export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PreactHeadmaster',
      fileName: (format) => `preact-headmaster.${format}.js`
    },
    rollupOptions: {
      external: [...Object.keys(pkg.peerDependencies || {})],
      output: {
        globals: {
          preact: 'preact'
        }
      }
    }
  }
});
