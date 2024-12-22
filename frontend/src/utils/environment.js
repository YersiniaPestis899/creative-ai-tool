/**
 * 環境管理の単一責任ユーティリティ
 */

// 本番環境URLの定数化
const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'

/**
 * URLの構築と管理を担当
 */
export const buildUrl = (path = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${PRODUCTION_URL}${cleanPath}`
}

/**
 * 環境の状態管理
 */
export const isProduction = () => {
  return window.location.origin === PRODUCTION_URL
}

/**
 * リダイレクト処理の統合管理
 */
export const handleRedirect = (path) => {
  const targetUrl = buildUrl(path)
  
  if (window.location.href !== targetUrl) {
    console.log('Redirecting to:', targetUrl, {
      current: window.location.href,
      isProduction: isProduction()
    })
    
    window.location.replace(targetUrl)
  }
}
