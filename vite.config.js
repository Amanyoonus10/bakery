import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        cakes: resolve(import.meta.dirname, 'cakes.html'),
        product: resolve(import.meta.dirname, 'product.html'),
      },
    },
  },
});
