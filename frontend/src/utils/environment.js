/**
 * 環境とURL管理の統合ユーティリティ
 */

// 定数定義
const ENV = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
}

const URLS = {
  PRODUCTION: 'https://creative-ai-tool.vercel.app',
  DEVELOPMENT: 'http://localhost:3000'
}

/**
 * 現在の実行環境を決定
 * @returns {string} 環境識別子
 */
const determineEnvironment = () => {
  // 複数の環境判定要因を評価
  const factors = {
    // 本番環境の判定要素
    isProduction: 
      import.meta.env.PROD ||
      window.location.hostname === 'creative-ai-tool.vercel.app' ||
      window.location.hostname.includes('vercel.app'),
    
    // 開発環境の判定要素
    isDevelopment:
      import.meta.env.DEV ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
  }

  // 環境判定のログ出力
  console.log('Environment Detection Factors:', {
    factors,
    hostname: window.location.hostname,
    mode: import.meta.env.MODE,
    currentUrl: window.location.href
  })

  return factors.isProduction ? ENV.PRODUCTION : ENV.DEVELOPMENT
}

/**
 * 現在の環境に基づいてベースURLを取得
 * @returns {string} ベースURL
 */
export const getBaseUrl = () => {
  const currentEnv = determineEnvironment()
  const baseUrl = URLS[currentEnv.toUpperCase()]

  console.log('URL Resolution:', {
    environment: currentEnv,
    baseUrl,
    currentLocation: window.location.href
  })

  return baseUrl
}

/**
 * 完全なURLを構築
 * @param {string} path - 追加するパス
 * @returns {string} 完全なURL
 */
export const buildUrl = (path = '') => {
  const base = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const fullUrl = `${base}${cleanPath}`

  console.log('URL Construction:', {
    base,
    path,
    fullUrl,
    environment: determineEnvironment()
  })

  return fullUrl
}

/**
 * 現在の環境が本番かどうかを判定
 * @returns {boolean}
 */
export const isProduction = () => determineEnvironment() === ENV.PRODUCTION