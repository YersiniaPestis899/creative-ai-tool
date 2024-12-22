import React, { useEffect } from 'react'
import { supabase } from '../lib/auth'

// 固定URL定義
const APP_URL = 'https://creative-ai-tool.vercel.app'

const AuthCallback = () => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 現在のURLをログ
        console.log('Callback processing:', {
          currentUrl: window.location.href
        })

        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Authentication error:', error)
          window.location.replace(new URL('/login', APP_URL).toString())
          return
        }

        if (session) {
          console.log('Authentication successful:', {
            userId: session.user.id
          })
          window.location.replace(APP_URL)
        } else {
          console.log('No session found')
          window.location.replace(new URL('/login', APP_URL).toString())
        }
      } catch (error) {
        console.error('Callback error:', error)
        window.location.replace(new URL('/login', APP_URL).toString())
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-lg text-gray-600">認証処理中...</p>
        <p className="mt-2 text-sm text-gray-400">リダイレクトしています...</p>
      </div>
    </div>
  )
}

export default AuthCallback