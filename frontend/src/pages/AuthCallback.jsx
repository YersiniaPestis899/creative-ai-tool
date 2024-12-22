import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Processing authentication callback...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Authentication session error:', error)
          throw error
        }

        if (session) {
          console.log('Authentication successful, redirecting to home...')
          // 絶対パスを使用して環境に依存しない遷移を実現
          window.location.href = new URL('/', window.location.origin).href
        } else {
          console.log('No session found, redirecting to login...')
          // 同様に絶対パスを使用
          window.location.href = new URL('/login', window.location.origin).href
        }
      } catch (error) {
        console.error('Authentication callback error:', error)
        window.location.href = new URL('/login', window.location.origin).href
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"/>
    </div>
  )
}

export default AuthCallback