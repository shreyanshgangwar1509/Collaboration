import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'


export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@chakra-ui/react", "@monaco-editor/react"],
    exclude: ['react-router'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})
