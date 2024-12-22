/**
 * 環境管理ユーティリティ
 */

const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'
const DEVELOPMENT_URL = 'http://localhost:3000'

/**
 * 本番環境検出
 */
export const isProduction = () => {
  if (typeof window === 'undefined') return import.meta.env.PROD
  return window.location.hostname.includes('vercel.app') ||
         import.meta.env.PROD ||
         window.location.protocol === 'https:'
}

/**
 * 基本URL取得
 */
export const getBaseUrl = () => {
  // 複数のフォールバックメカニズム
  const url = isProduction() ? PRODUCTION_URL : DEVELOPMENT_URL
  console.log('Environment URL:', { 
    url, 
    isProd: isProduction(), 
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR'
  })
  return url
}

/**
 * 完全なURL構築
 */
export const buildUrl = (path = '') => {
  const base = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const fullUrl = `${base}${cleanPath}`
  
  console.log('URL Construction:', {
    base,
    path,
    fullUrl,
    environment: import.meta.env.MODE
  })
  
  return fullUrl
}