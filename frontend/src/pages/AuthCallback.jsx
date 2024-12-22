import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'

const PROD_URL = 'https://creative-ai-tool.vercel.app'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error

        if (session) {
          console.log('Authentication successful')
          if (window.location.hostname === 'creative-ai-tool.vercel.app') {
            window.location.href = PROD_URL
          } else {
            navigate('/')
          }
        } else {
          console.log('No session found')
          if (window.location.hostname === 'creative-ai-tool.vercel.app') {
            window.location.href = `${PROD_URL}/login`
          } else {
            navigate('/login')
          }
        }
      } catch (error) {
        console.error('Callback error:', error)
        if (window.location.hostname === 'creative-ai-tool.vercel.app') {
          window.location.href = `${PROD_URL}/login`
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto" />
        <p className="mt-4 text-lg text-gray-600">認証処理中...</p>
      </div>
    </div>
  )
}