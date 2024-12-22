/**
 * 環境管理ユーティリティ
 */

// 定数定義
const URLS = {
  PRODUCTION: 'https://creative-ai-tool.vercel.app',
  DEVELOPMENT: 'http://localhost:3000'
}

/**
 * 環境チェック関数
 */
const checkEnvironment = () => {
  if (typeof window === 'undefined') {
    return {
      isProd: import.meta.env.PROD,
      baseUrl: URLS.PRODUCTION
    }
  }

  const isProd = 
    window.location.hostname === 'creative-ai-tool.vercel.app' ||
    window.location.hostname.includes('vercel.app')

  return {
    isProd,
    baseUrl: isProd ? URLS.PRODUCTION : URLS.DEVELOPMENT
  }
}

/**
 * 環境状態の取得
 */
const getEnvironmentState = () => {
  const { isProd, baseUrl } = checkEnvironment()
  return { isProd, baseUrl }
}

/**
 * URL生成
 */
export const buildUrl = (path = '') => {
  const { baseUrl } = getEnvironmentState()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

/**
 * 本番環境チェック
 */
export const isProduction = () => {
  const { isProd } = getEnvironmentState()
  return isProd
}

/**
 * リダイレクト処理
 */
export const redirectToUrl = (path) => {
  if (typeof window !== 'undefined') {
    const targetUrl = buildUrl(path)
    console.log('Redirecting to:', targetUrl)
    window.location.replace(targetUrl)
  }
}