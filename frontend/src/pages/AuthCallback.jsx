import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/auth'
import { isProduction, handleRedirect } from '../utils/environment'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const processAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth error:', error)
          handleRedirect('/login')
          return
        }

        if (session) {
          console.log('Auth success')
          handleRedirect('/')
        } else {
          console.log('No session found')
          handleRedirect('/login')
        }
      } catch (error) {
        console.error('Auth process error:', error)
        handleRedirect('/login')
      }
    }

    processAuth()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-lg text-gray-600">認証処理中...</p>
        <p className="mt-2 text-sm text-gray-500">
          {isProduction() ? '本番環境' : '開発環境'}
        </p>
      </div>
    </div>
  )
}

export default AuthCallback