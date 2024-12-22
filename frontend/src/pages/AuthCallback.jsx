import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'

const PROD_URL = 'https://creative-ai-tool.vercel.app'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Processing callback at:', window.location.href)

        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          window.location.replace(`${PROD_URL}/login`)
          return
        }

        if (session) {
          console.log('Authentication successful')
          window.location.replace(PROD_URL)
        } else {
          console.log('No session found')
          window.location.replace(`${PROD_URL}/login`)
        }
      } catch (error) {
        console.error('Callback error:', error)
        window.location.replace(`${PROD_URL}/login`)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-lg text-gray-600">認証処理中...</p>
        <p className="mt-2 text-sm text-gray-400">
          リダイレクトしています...
        </p>
      </div>
    </div>
  )
}

export default AuthCallback