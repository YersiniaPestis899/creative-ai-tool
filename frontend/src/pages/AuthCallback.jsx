import { useEffect } from 'react'
import { supabase } from '../lib/auth'
import { handleRedirect, isProduction } from '../utils/environment'

const AuthCallback = () => {
  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('Auth Callback: Processing', {
          currentUrl: window.location.href
        })

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth Error:', error)
          handleRedirect('/login')
          return
        }

        if (session) {
          console.log('Auth Success')
          handleRedirect('/')
        } else {
          console.log('No Session Found')
          handleRedirect('/login')
        }
      } catch (error) {
        console.error('Auth Process Failed:', error)
        handleRedirect('/login')
      }
    }

    processCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"/>
        <p className="mt-4 text-lg text-gray-600">認証処理中...</p>
        <p className="mt-2 text-sm text-gray-500">
          {window.location.origin}
        </p>
      </div>
    </div>
  )
}

export default AuthCallback