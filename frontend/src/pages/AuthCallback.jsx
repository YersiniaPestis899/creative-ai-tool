import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'
import { buildUrl } from '../utils/environment'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        // 現在のURLパラメータを解析
        const params = new URLSearchParams(window.location.search)
        console.log('コールバックパラメータ:', {
          hasCode: params.has('code'),
          hasError: params.has('error'),
          timestamp: new Date().toISOString()
        })

        // セッション状態の確認
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('セッション確認エラー:', sessionError)
          window.location.replace(buildUrl('/login'))
          return
        }

        if (session) {
          console.log('認証成功:', {
            userId: session.user.id,
            timestamp: new Date().toISOString()
          })
          
          // リダイレクト前の状態保存
          const redirectTarget = buildUrl('/')
          console.log('リダイレクト実行:', {
            target: redirectTarget,
            timestamp: new Date().toISOString()
          })
          
          window.location.replace(redirectTarget)
        } else {
          console.log('セッションなし - ログインへリダイレクト:', {
            timestamp: new Date().toISOString()
          })
          window.location.replace(buildUrl('/login'))
        }
      } catch (error) {
        console.error('コールバック処理エラー:', {
          error,
          stack: error.stack,
          timestamp: new Date().toISOString()
        })
        window.location.replace(buildUrl('/login'))
      }
    }

    processAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"/>
        <p className="mt-4 text-lg text-gray-600">認証処理中...</p>
        <p className="mt-2 text-sm text-gray-400">
          しばらくお待ちください
        </p>
      </div>
    </div>
  )
}

export default AuthCallback