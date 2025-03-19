import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'


export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@chakra-ui/react"],
     include: ['@monaco-editor/react'],
  },
})
