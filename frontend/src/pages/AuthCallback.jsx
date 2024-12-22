import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'
import { buildUrl, isProduction } from '../utils/environment'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth Callback: Starting process', {
          currentUrl: window.location.href,
          isProduction: isProduction(),
          environment: import.meta.env.MODE
        })

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth Callback Error:', error)
          throw error
        }

        if (session) {
          const redirectUrl = buildUrl('/')
          console.log('Auth Success: Redirecting to:', redirectUrl)
          
          // React Routerのnavigateを使用
          if (isProduction()) {
            window.location.replace(buildUrl('/'))
          } else {
            navigate('/')
          }
        } else {
          console.log('No Session: Redirecting to login')
          const loginUrl = buildUrl('/login')
          
          if (isProduction()) {
            window.location.replace(loginUrl)
          } else {
            navigate('/login')
          }
        }
      } catch (error) {
        console.error('Auth Callback Failed:', error)
        const errorUrl = buildUrl('/login')
        
        if (isProduction()) {
          window.location.replace(errorUrl)
        } else {
          navigate('/login')
        }
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