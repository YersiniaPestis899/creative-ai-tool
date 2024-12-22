import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'
import { ensureProductionUrl } from '../utils/environment'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Processing authentication callback')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Authentication session error:', error)
          throw error
        }

        if (session) {
          console.log('Authentication successful')
          const redirectUrl = ensureProductionUrl('/')
          console.log('Redirecting to:', redirectUrl)
          window.location.href = redirectUrl
        } else {
          console.log('No session found')
          const loginUrl = ensureProductionUrl('/login')
          console.log('Redirecting to login:', loginUrl)
          window.location.href = loginUrl
        }
      } catch (error) {
        console.error('Authentication callback error:', error)
        const errorUrl = ensureProductionUrl('/login')
        console.log('Error redirect to:', errorUrl)
        window.location.href = errorUrl
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto"/>
        <p className="mt-4 text-gray-600">認証処理中...</p>
        <p className="mt-2 text-sm text-gray-500">環境: {import.meta.env.MODE}</p>
      </div>
    </div>
  )
}

export default AuthCallback