import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'
import { handleCallbackUrl } from '../utils/environment'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('Processing authentication callback', {
          url: window.location.href,
          timestamp: new Date().toISOString()
        })

        const { code, error, redirectUrl } = handleCallbackUrl()
        
        if (error) {
          console.error('Authentication error from callback:', error)
          window.location.replace(redirectUrl)
          return
        }

        if (code) {
          const { data: { session }, error: sessionError } = 
            await supabase.auth.getSession()

          if (sessionError) {
            console.error('Session retrieval error:', sessionError)
            throw sessionError
          }

          if (session) {
            console.log('Authentication successful, redirecting')
            window.location.replace(redirectUrl)
          } else {
            console.log('No session found, redirecting to login')
            window.location.replace('/login')
          }
        }
      } catch (error) {
        console.error('Callback processing error:', error)
        window.location.replace('/login')
      }
    }

    processCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"/>
        <p className="mt-4 text-lg text-gray-600">認証を処理しています...</p>
        <p className="mt-2 text-sm text-gray-500">
          {import.meta.env.PROD ? '本番環境' : '開発環境'}
        </p>
      </div>
    </div>
  )
}

export default AuthCallback