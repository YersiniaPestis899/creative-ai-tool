import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_APP_URL': JSON.stringify(process.env.VITE_APP_URL),
    '__PROD__': JSON.stringify(process.env.NODE_ENV === 'production'),
  }
})