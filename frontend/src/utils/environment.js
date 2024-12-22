// 定数定義
const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'

/**
 * 環境判定ユーティリティ
 */
export const isProduction = () => {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'creative-ai-tool.vercel.app' ||
         window.location.hostname.includes('vercel.app')
}

/**
 * URL構築ユーティリティ
 */
export const buildUrl = (path = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${PRODUCTION_URL}${cleanPath}`
}

/**
 * リダイレクト実行関数
 */
export const handleRedirect = (path) => {
  if (typeof window === 'undefined') return
  
  const targetUrl = buildUrl(path)
  if (window.location.href !== targetUrl) {
    window.location.replace(targetUrl)
  }
}