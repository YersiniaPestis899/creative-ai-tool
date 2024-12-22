import React, { useEffect, useCallback } from 'react'
import { supabase } from '../lib/auth'

const PROD_URL = 'https://creative-ai-tool.vercel.app'

const AuthCallback = () => {
  const handleAuthCallback = useCallback(async () => {
    try {
      // セッション状態の確認
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('認証エラー:', error)
        window.location.replace(`${PROD_URL}/login`)
        return
      }

      if (!session) {
        console.log('セッションなし')
        window.location.replace(`${PROD_URL}/login`)
        return
      }

      console.log('認証成功:', { 
        userId: session.user.id,
        timestamp: new Date().toISOString()
      })

      // メインページへリダイレクト
      window.location.replace(PROD_URL)
    } catch (error) {
      console.error('コールバックエラー:', error)
      window.location.replace(`${PROD_URL}/login`)
    }
  }, [])

  useEffect(() => {
    handleAuthCallback()
  }, [handleAuthCallback])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-lg text-gray-600">認証処理中...</p>
      </div>
    </div>
  )
}

export default AuthCallback