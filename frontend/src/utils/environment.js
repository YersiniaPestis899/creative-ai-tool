const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'
const DEVELOPMENT_URL = 'http://localhost:3000'

export const isProduction = () => {
  if (!globalThis.window) return false
  return globalThis.window.location.hostname.includes('vercel.app')
}

export const getBaseUrl = () => {
  return isProduction() ? PRODUCTION_URL : DEVELOPMENT_URL
}

export const buildUrl = (path) => {
  const baseUrl = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

export const handleRedirect = (path) => {
  if (!globalThis.window) return
  const url = buildUrl(path)
  globalThis.window.location.replace(url)
}