import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    include: ['**/*.e2e.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/vitest.config.e2e.ts'],
    globals: true,
    root: './',
    setupFiles: ['./tests/setup-e2e.ts'],
    alias: {
      '@src': './src',
      '@test': './test',
    },
  },
  plugins: [tsconfigPaths(), swc.vite({ module: { type: 'es6' } })],
});
