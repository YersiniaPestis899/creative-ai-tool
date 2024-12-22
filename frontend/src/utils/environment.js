/**
 * 環境とURL管理の最適化モジュール
 */

const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'

/**
 * 本番環境での動作確認
 */
export const isProduction = () => {
  if (!globalThis.window) return false
  return globalThis.window.location.hostname === 'creative-ai-tool.vercel.app' ||
         globalThis.window.location.hostname.includes('vercel.app')
}

/**
 * URL生成のための基本URL取得
 */
export const getBaseUrl = () => PRODUCTION_URL

/**
 * 完全なURLの構築
 */
export const buildUrl = (path = '/') => {
  const base = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

/**
 * リダイレクト処理の実行
 */
export const handleRedirect = (path) => {
  if (!globalThis.window) return

  const targetUrl = buildUrl(path)
  console.log('Redirect Execution:', {
    target: targetUrl,
    current: globalThis.window.location.href,
    timestamp: new Date().toISOString()
  })

  // 直接のURL置換による確実なリダイレクト
  globalThis.window.location.replace(targetUrl)
}