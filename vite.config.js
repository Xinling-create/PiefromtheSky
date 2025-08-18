import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // 非常重要：打包后资源路径改为相对路径
  build: {
    outDir: 'dist',
  },
})
