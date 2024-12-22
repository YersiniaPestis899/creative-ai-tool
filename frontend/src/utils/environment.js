/**
 * 環境設定の単一ソース
 */

const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'

/**
 * 環境チェック - サーバーサイドレンダリング対応
 */
const checkEnvironment = () => {
  try {
    if (typeof window === 'undefined') {
      return {
        isProd: process.env.NODE_ENV === 'production',
        origin: PRODUCTION_URL
      }
    }
    
    return {
      isProd: window.location.origin === PRODUCTION_URL,
      origin: window.location.origin
    }
  } catch {
    return {
      isProd: false,
      origin: PRODUCTION_URL
    }
  }
}

/**
 * URL生成 - エラー耐性強化
 */
export const buildUrl = (path = '') => {
  try {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${PRODUCTION_URL}${cleanPath}`
  } catch (error) {
    console.error('URL construction error:', error)
    return PRODUCTION_URL
  }
}

/**
 * 本番環境チェック - 堅牢性確保
 */
export const isProduction = () => {
  try {
    return checkEnvironment().isProd
  } catch {
    return false
  }
}

/**
 * リダイレクト処理 - 信頼性向上
 */
export const handleRedirect = (path) => {
  try {
    const targetUrl = buildUrl(path)
    
    if (typeof window !== 'undefined' && window.location.href !== targetUrl) {
      console.log('Redirect initiated:', {
        from: window.location.href,
        to: targetUrl
      })
      window.location.replace(targetUrl)
    }
  } catch (error) {
    console.error('Redirect error:', error)
    if (typeof window !== 'undefined') {
      window.location.href = PRODUCTION_URL
    }
  }
}