import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'

const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Processing authentication callback in:', import.meta.env.MODE)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Authentication session error:', error)
          throw error
        }

        if (session) {
          console.log('Authentication successful')
          if (import.meta.env.PROD) {
            window.location.href = `${PRODUCTION_URL}/`
          } else {
            navigate('/', { replace: true })
          }
        } else {
          console.log('No session found')
          if (import.meta.env.PROD) {
            window.location.href = `${PRODUCTION_URL}/login`
          } else {
            navigate('/login', { replace: true })
          }
        }
      } catch (error) {
        console.error('Authentication callback error:', error)
        if (import.meta.env.PROD) {
          window.location.href = `${PRODUCTION_URL}/login`
        } else {
          navigate('/login', { replace: true })
        }
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto"/>
        <p className="mt-4 text-gray-600">認証処理中...</p>
      </div>
    </div>
  )
}

export default AuthCallback