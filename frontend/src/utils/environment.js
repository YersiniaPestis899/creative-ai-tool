/**
 * 環境設定の管理用ユーティリティ
 */

const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'
const DEVELOPMENT_URL = 'http://localhost:3000'

// 環境判定の微修正
export const isProduction = () => {
  if (typeof window === 'undefined') return false
  
  const hostname = window.location.hostname
  return hostname === 'creative-ai-tool.vercel.app' || 
         hostname.includes('vercel.app')
}

// ベースURL取得ロジックの更新
export const getBaseUrl = () => {
  try {
    return isProduction() ? PRODUCTION_URL : DEVELOPMENT_URL
  } catch {
    return DEVELOPMENT_URL
  }
}

// URL構築ロジックの最適化
export const buildUrl = (path = '') => {
  try {
    const base = getBaseUrl()
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${base}${cleanPath}`
  } catch {
    console.warn('URLの構築中にエラーが発生しました')
    return '/'
  }
}

// コールバックURL処理の堅牢化
export const handleCallbackUrl = () => {
  try {
    if (typeof window === 'undefined') {
      return { redirectUrl: '/' }
    }

    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')
    
    return {
      code,
      error,
      redirectUrl: error ? buildUrl('/login') : buildUrl('/')
    }
  } catch {
    return { redirectUrl: '/' }
  }
}