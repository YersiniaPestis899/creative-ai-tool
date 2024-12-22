/**
 * 環境管理ユーティリティ
 */

// 定数設定
const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'
const DEVELOPMENT_URL = 'http://localhost:3000'

// 環境判定と基本URL取得
const getEnvironmentData = () => {
  const isProd = 
    import.meta.env.PROD || 
    (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'))

  return {
    isProd,
    baseUrl: isProd ? PRODUCTION_URL : DEVELOPMENT_URL,
    currentUrl: typeof window !== 'undefined' ? window.location.href : ''
  }
}

// URL構築の基本機能
export const buildUrl = (path = '') => {
  const { baseUrl } = getEnvironmentData()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

// 本番環境チェック
export const isProduction = () => {
  const { isProd } = getEnvironmentData()
  return isProd
}

// リダイレクト処理
export const redirectToUrl = (path) => {
  const targetUrl = buildUrl(path)
  if (typeof window !== 'undefined') {
    window.location.replace(targetUrl)
  }
  return targetUrl
}

// 現在のURLが本番環境かどうかを確認
export const isProductionUrl = () => {
  if (typeof window === 'undefined') return false
  return window.location.origin === PRODUCTION_URL
}

// エラー時のフォールバックURL取得
export const getFallbackUrl = () => {
  return PRODUCTION_URL
}

// デバッグ情報の出力
export const logEnvironmentInfo = () => {
  const envData = getEnvironmentData()
  console.log('Environment Information:', {
    ...envData,
    mode: import.meta.env.MODE,
    nodeEnv: process.env.NODE_ENV
  })
}
