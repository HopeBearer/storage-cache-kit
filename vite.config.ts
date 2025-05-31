import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UnifiedCache',
      fileName: (format) => {
        if (format === 'es') return 'index.mjs';
        if (format === 'umd') return 'index.umd.js';
        return `index.${format}`;
      },
      formats: ['es', 'cjs', 'umd'],
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        exports: 'named',
        globals: {
          // 如果有外部依赖，在这里定义它们的全局变量名
        },
      },
    },
    emptyOutDir: true,
  },
}); 