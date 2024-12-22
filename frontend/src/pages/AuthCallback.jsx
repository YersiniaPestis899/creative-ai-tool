import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'
import { redirectToUrl, isProduction, buildUrl } from '../utils/environment'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth Callback: Processing', {
          currentUrl: window.location.href,
          isProduction: isProduction()
        })

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth Error:', error)
          redirectToUrl('/login')
          return
        }

        if (session) {
          console.log('Auth Success')
          if (isProduction()) {
            redirectToUrl('/')
          } else {
            navigate('/')
          }
        } else {
          console.log('No Session')
          if (isProduction()) {
            redirectToUrl('/login')
          } else {
            navigate('/login')
          }
        }
      } catch (error) {
        console.error('Auth Failed:', error)
        redirectToUrl('/login')
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
      </div>
    </div>
  )
}