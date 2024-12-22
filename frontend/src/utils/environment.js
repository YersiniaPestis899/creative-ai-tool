const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'
const DEVELOPMENT_URL = 'http://localhost:3000'

export const getEnvironmentUrl = () => {
  // 複数の方法で環境を検出
  const isProd = 
    import.meta.env.PROD || 
    import.meta.env.MODE === 'production' ||
    window.location.hostname === 'creative-ai-tool.vercel.app'

  console.log('Environment Detection:', {
    PROD: import.meta.env.PROD,
    MODE: import.meta.env.MODE,
    hostname: window.location.hostname,
    isProd
  })

  return isProd ? PRODUCTION_URL : DEVELOPMENT_URL
}

export const ensureProductionUrl = (path = '') => {
  const baseUrl = getEnvironmentUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const fullUrl = `${baseUrl}${cleanPath}`
  
  console.log('URL Generation:', {
    baseUrl,
    path,
    fullUrl
  })
  
  return fullUrl
}