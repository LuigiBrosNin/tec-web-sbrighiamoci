import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { viteStaticCopy } from 'vite-plugin-static-copy'


// https://vitejs.dev/config/
export default defineConfig({
  //root: "vite/",
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: './dist/vite/index.html', 
          dest: './',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  build: {
    rollupOptions: {
      input: {
        app: './vite/index.html',
      },
    },
  },
  server: {
    open: './vite/index.html',
  }
})
