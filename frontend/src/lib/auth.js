import { createClient } from '@supabase/supabase-js'

// 認証関連の定数定義
const SUPABASE_URL = 'https://inichkwyezruanpovcff.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaWNoa3d5ZXpydWFucG92Y2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODgxODgsImV4cCI6MjA1MDM2NDE4OH0.Vy2HWo3LrQBZPgTjaRr0-6ommN90Xh9uUizKUhQllvI'
const PROD_URL = 'https://creative-ai-tool.vercel.app'

// クライアント初期化検証
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Required authentication configuration is missing')
}

// Supabaseクライアントの設定
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

/**
 * Google認証プロセス
 */
export const signInWithGoogle = async () => {
  try {
    console.log('Starting authentication process')
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${PROD_URL}/auth/callback`,
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
 * サインアウト処理
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    window.location.href = PROD_URL
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

/**
 * セッション管理
 */
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    
    return session?.user || null
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}