import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'
import { buildUrl, handleRedirect } from '../utils/environment'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        console.log('認証コールバック処理開始:', {
          url: window.location.href,
          timestamp: new Date().toISOString()
        })

        // セッション取得
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('セッションエラー:', sessionError)
          handleRedirect('/login')
          return
        }

        if (session) {
          console.log('認証成功 - メインページへリダイレクト:', {
            userId: session.user.id,
            timestamp: new Date().toISOString()
          })

          // アプリケーションのメインページへのリダイレクト
          const mainPageUrl = buildUrl('/')
          window.location.replace(mainPageUrl)
        } else {
          console.log('セッションなし - ログインページへリダイレクト')
          handleRedirect('/login')
        }
      } catch (error) {
        console.error('認証コールバックエラー:', {
          error,
          stack: error.stack,
          timestamp: new Date().toISOString()
        })
        handleRedirect('/login')
      }
    }

    // 認証コールバックの即時実行
    processAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"/>
        <p className="mt-4 text-lg text-gray-600">認証処理中...</p>
        <p className="mt-2 text-sm text-gray-400">リダイレクトします...</p>
      </div>
    </div>
  )
}

export default AuthCallback