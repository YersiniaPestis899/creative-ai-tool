const URLS = {
  PRODUCTION: 'https://creative-ai-tool.vercel.app',
  DEVELOPMENT: 'http://localhost:3000'
}

export const isProduction = () => {
  if (typeof window === 'undefined') {
    return import.meta.env.PROD
  }
  
  return window.location.hostname.includes('vercel.app')
}

export const buildUrl = (path = '') => {
  const baseUrl = isProduction() ? URLS.PRODUCTION : URLS.DEVELOPMENT
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

export const handleRedirect = (path) => {
  const url = buildUrl(path)
  if (typeof window !== 'undefined') {
    window.location.replace(url)
  }
}