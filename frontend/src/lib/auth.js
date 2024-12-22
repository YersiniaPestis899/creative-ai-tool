import { createClient } from '@supabase/supabase-js'
import { getEnvironmentUrl, ensureProductionUrl } from '../utils/environment'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',  // PKCE認証フローを使用
    debug: true        // デバッグモード有効化
  }
})

export const signInWithGoogle = async () => {
  try {
    // 環境情報のログ出力
    console.log('Environment Information:', {
      mode: import.meta.env.MODE,
      baseUrl: getEnvironmentUrl(),
      userAgent: navigator.userAgent
    })

    const redirectUrl = ensureProductionUrl('/auth/callback')
    console.log('OAuth Configuration:', {
      redirectUrl,
      provider: 'google'
    })

    // エラーハンドリングの強化
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error)
    })

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
    })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,  // ブラウザリダイレクトを確実に実行
      }
    })

    if (error) {
      console.error('Authentication error details:', {
        error,
        timestamp: new Date().toISOString(),
        context: 'signInWithGoogle'
      })
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Detailed error information:', {
      error,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    throw error
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    const redirectUrl = getEnvironmentUrl()
    console.log('Sign out redirect:', redirectUrl)
    window.location.href = redirectUrl
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session?.user || null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}