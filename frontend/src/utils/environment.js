// 定数定義
const ENV = {
  PRODUCTION: {
    URL: 'https://creative-ai-tool.vercel.app',
    HOSTNAME: 'creative-ai-tool.vercel.app'
  }
}

/**
 * 環境判定
 */
export const isProduction = () => {
  try {
    if (typeof window === 'undefined') return false
    return window.location.hostname === ENV.PRODUCTION.HOSTNAME
  } catch {
    return false
  }
}

/**
 * リダイレクトURL構築
 */
export const buildUrl = (path = '/') => {
  try {
    const base = ENV.PRODUCTION.URL
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${base}${cleanPath}`
  } catch (error) {
    console.error('URL construction error:', error)
    return ENV.PRODUCTION.URL
  }
}

/**
 * リダイレクト処理実行
 */
export const handleRedirect = (path) => {
  try {
    if (typeof window === 'undefined') return
    const url = buildUrl(path)
    window.location.replace(url)
  } catch (error) {
    console.error('Redirect error:', error)
    if (typeof window !== 'undefined') {
      window.location.href = ENV.PRODUCTION.URL
    }
  }
}