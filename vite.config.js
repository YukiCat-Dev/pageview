// vite.config.ts
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'node:path'
import pkg from './package.json'
import { visualizer } from 'rollup-plugin-visualizer';
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts(), solidPlugin(), process.env.ANALYZE && visualizer()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/init.tsx'),
      formats: ['es', 'cjs'],
      // the proper extensions will be added
      fileName: 'index'
    },
    target: 'esnext',
    minify: false,
    reportCompressedSize: false,
    sourcemap: true,
    rollupOptions: {
      external: Object.keys(pkg.dependencies).map(moduleName => new RegExp('^' + moduleName))
    },
    emptyOutDir: false // 手动清空
  },
});