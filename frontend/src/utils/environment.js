/**
 * Environment and URL management utilities
 */

const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'
const DEVELOPMENT_URL = 'http://localhost:3000'

/**
 * Enhanced environment detection with multiple fallback mechanisms
 */
export const isProduction = () => {
  // Multiple checks for production environment
  const checks = {
    mode: import.meta.env.PROD,
    hostname: window.location.hostname === 'creative-ai-tool.vercel.app',
    protocol: window.location.protocol === 'https:',
    domain: window.location.hostname.includes('vercel.app')
  }

  console.log('Environment Checks:', checks)
  
  // Return true if any production indicator is present
  return Object.values(checks).some(Boolean)
}

/**
 * Get the base URL for the current environment
 */
export const getBaseUrl = () => {
  const envUrl = isProduction() ? PRODUCTION_URL : DEVELOPMENT_URL
  console.log('Resolved Base URL:', envUrl)
  return envUrl
}

/**
 * Construct an absolute URL for the current environment
 */
export const buildUrl = (path) => {
  const base = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const fullUrl = `${base}${cleanPath}`
  
  console.log('URL Construction:', {
    base,
    path,
    fullUrl,
    isProduction: isProduction()
  })
  
  return fullUrl
}

/**
 * Parse and handle authentication callback URLs
 */
export const handleCallbackUrl = (currentUrl = window.location.href) => {
  const url = new URL(currentUrl)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  
  console.log('Callback URL Analysis:', {
    currentUrl,
    code: code ? 'present' : 'absent',
    error,
    isProduction: isProduction()
  })
  
  return {
    code,
    error,
    redirectUrl: buildUrl(error ? '/login' : '/')
  }
}
