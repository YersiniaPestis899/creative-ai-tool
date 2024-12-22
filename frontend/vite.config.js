import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios', '@supabase/supabase-js']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['axios', '@supabase/supabase-js']
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  envPrefix: 'VITE_',
})