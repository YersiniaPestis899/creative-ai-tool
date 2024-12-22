import { createClient } from '@supabase/supabase-js'

// 固定値による環境定義
const APP_URL = 'https://creative-ai-tool.vercel.app'
const SUPABASE_URL = 'https://inichkwyezruanpovcff.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaWNoa3d5ZXpydWFucG92Y2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODgxODgsImV4cCI6MjA1MDM2NDE4OH0.Vy2HWo3LrQBZPgTjaRr0-6ommN90Xh9uUizKUhQllvI'

// Supabaseクライアント初期化
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

/**
 * 認証処理の実装
 */
export const signInWithGoogle = async () => {
  try {
    // 固定コールバックURLの設定
    const redirectUrl = new URL('/auth/callback', APP_URL).toString()
    console.log('Authentication configuration:', { redirectUrl })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })

    if (error) throw error
    return data

  } catch (error) {
    console.error('Authentication error:', error)
    throw error
  }
}

/**
 * ログアウト処理
 */
export const signOut = async () => {
  try {
    await supabase.auth.signOut()
    window.location.replace(APP_URL)
  } catch (error) {
    console.error('Signout error:', error)
    window.location.replace(APP_URL)
  }
}

/**
 * 現在のユーザー取得
 */
export const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user || null
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}