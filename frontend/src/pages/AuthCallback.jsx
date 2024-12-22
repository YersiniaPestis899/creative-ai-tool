import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'
import { buildUrl } from '../utils/environment'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth Callback: Processing authentication')
        console.log('Current URL:', window.location.href)
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth Callback Error:', error)
          throw error
        }

        if (session) {
          console.log('Auth Success: Redirecting to home')
          window.location.href = buildUrl('/')
        } else {
          console.log('No Session: Redirecting to login')
          window.location.href = buildUrl('/login')
        }
      } catch (error) {
        console.error('Auth Callback Failed:', error)
        window.location.href = buildUrl('/login')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto"/>
        <p className="mt-4 text-gray-600">認証処理中...</p>
        <p className="mt-2 text-sm text-gray-500">
          環境: {import.meta.env.MODE === 'production' ? '本番' : '開発'}
        </p>
      </div>
    </div>
  )
}

export default AuthCallback