import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'
import { 
  redirectToUrl, 
  isProduction, 
  logEnvironmentInfo,
  isProductionUrl,
  getFallbackUrl
} from '../utils/environment'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 環境情報のログ出力
        logEnvironmentInfo()
        
        console.log('Processing authentication callback', {
          currentUrl: window.location.href,
          isProduction: isProduction(),
          isProductionUrl: isProductionUrl()
        })

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Authentication session error:', error)
          redirectToUrl('/login')
          return
        }

        if (session) {
          console.log('Authentication successful')
          if (isProductionUrl()) {
            redirectToUrl('/')
          } else {
            navigate('/')
          }
        } else {
          console.log('No session found')
          if (isProductionUrl()) {
            redirectToUrl('/login')
          } else {
            navigate('/login')
          }
        }
      } catch (error) {
        console.error('Authentication callback error:', error)
        const fallbackUrl = getFallbackUrl()
        console.log('Redirecting to fallback:', fallbackUrl)
        window.location.replace(`${fallbackUrl}/login`)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"/>
        <p className="mt-4 text-lg text-gray-600">認証処理中...</p>
        <p className="mt-2 text-sm text-gray-500">
          環境: {isProduction() ? '本番' : '開発'}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {window.location.hostname}
        </p>
      </div>
    </div>
  )
}

export default AuthCallback