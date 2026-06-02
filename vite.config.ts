import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { copyFileSync as copyFile } from 'fs'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: './',
  root: '.',
  server: {
    static: {
      directory: resolve(__dirname, 'public'),
      publicPath: '/',
    },
  },
  build: {
    outDir: 'build/renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})

// 复制 click-effect.html 到构建目录
const copyClickEffectHTML = () => {
  const srcPath = resolve(__dirname, 'src/renderer/click-effect.html')
  const destPath = resolve(__dirname, 'build/renderer/click-effect.html')
  
  if (existsSync(srcPath)) {
    const destDir = resolve(__dirname, 'build/renderer')
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true })
    }
    copyFileSync(srcPath, destPath)
    console.log('Copied click-effect.html to build/renderer/')
  }
}

// 在构建后执行复制
if (process.env.NODE_ENV === 'production') {
  copyClickEffectHTML()
}
