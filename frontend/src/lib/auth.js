import { createClient } from '@supabase/supabase-js'
import { getBaseUrl } from '../utils/environment'

const SUPABASE_URL = 'https://inichkwyezruanpovcff.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaWNoa3d5ZXpydWFucG92Y2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDMyMzIxNjgsImV4cCI6MjAxODgwODE2OH0.zDhPOJpxmCcgvq1BUvgSOr86h5kjYgERD5cL_Dw5NFk'

// Supabaseクライアントの初期化前の検証
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('必要な認証情報が不足しています')
}

// クライアントインスタンスの作成と設定
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: true
  }
})

// Google認証プロセスの実装
export const signInWithGoogle = async () => {
  try {
    const currentUrl = getBaseUrl()
    const redirectUrl = `${currentUrl}/auth/callback`
    
    console.log('認証フロー開始:', {
      currentUrl,
      redirectUrl,
      timestamp: new Date().toISOString()
    })
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
        scopes: 'email profile'
      }
    })

    if (error) {
      console.error('認証エラー:', error)
      throw error
    }
    
    console.log('認証フロー完了:', {
      success: true,
      timestamp: new Date().toISOString(),
      redirectUrl
    })
    
    return data
  } catch (error) {
    console.error('認証プロセスエラー:', {
      error,
      timestamp: new Date().toISOString(),
      stack: error.stack
    })
    throw error
  }
}

// サインアウト処理の実装
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('サインアウトエラー:', error)
      throw error
    }
    
    const baseUrl = getBaseUrl()
    console.log('サインアウト完了:', {
      success: true,
      redirectTo: baseUrl,
      timestamp: new Date().toISOString()
    })
    
    window.location.href = baseUrl
  } catch (error) {
    console.error('サインアウト処理エラー:', error)
    throw error
  }
}

// セッション管理の実装
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('セッション取得エラー:', error)
      throw error
    }

    console.log('セッション状態:', {
      exists: !!session,
      timestamp: new Date().toISOString()
    })
    
    return session?.user || null
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error)
    return null
  }
}