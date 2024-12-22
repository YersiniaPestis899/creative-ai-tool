import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ビルド設定の最適化
    outDir: 'dist',
    sourcemap: true,
    // キャッシュの無効化
    emptyOutDir: true,
    // チャンクサイズの最適化
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // 開発サーバー設定
    port: 3000,
    strictPort: true,
  },
  // 環境変数の明示的な処理
  envPrefix: 'VITE_',
})