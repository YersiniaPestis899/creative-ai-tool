/**
 * 環境とURL管理のユーティリティ
 */

const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'
const DEVELOPMENT_URL = 'http://localhost:3000'

/**
 * 本番環境の判定
 */
export const isProduction = () => {
  // 複数の条件で本番環境を判定
  const isProd = typeof window !== 'undefined' && (
    window.location.hostname === 'creative-ai-tool.vercel.app' ||
    window.location.hostname.includes('vercel.app')
  )
  return isProd
}

/**
 * 基本URLの取得
 */
export const getBaseUrl = () => {
  const baseUrl = isProduction() ? PRODUCTION_URL : DEVELOPMENT_URL
  return baseUrl
}

/**
 * 完全なURLの構築
 */
export const buildUrl = (path) => {
  const base = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

/**
 * 認証コールバックURLの処理
 */
export const handleCallbackUrl = () => {
  if (typeof window === 'undefined') return { redirectUrl: '/' }

  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  
  return {
    code,
    error,
    redirectUrl: buildUrl(error ? '/login' : '/')
  }
}