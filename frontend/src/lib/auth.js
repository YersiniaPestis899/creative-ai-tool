import { createClient } from '@supabase/supabase-js'

const PROD_URL = 'https://creative-ai-tool.vercel.app'
const SUPABASE_URL = 'https://inichkwyezruanpovcff.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaWNoa3d5ZXpydWFucG92Y2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODgxODgsImV4cCI6MjA1MDM2NDE4OH0.Vy2HWo3LrQBZPgTjaRr0-6ommN90Xh9uUizKUhQllvI'

// セッション永続化の設定
const sessionConfig = {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: globalThis.localStorage,
    storageKey: 'creative-ai-auth-token',
    debug: true
  },
  global: {
    headers: {
      'X-Client-Info': 'creative-ai-tool'
    }
  }
}

// Supabaseクライアントの初期化
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  sessionConfig
)

/**
 * OAuth認証の実装
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${PROD_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        },
        skipBrowserRedirect: false
      }
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('認証エラー:', error)
    throw error
  }
}

/**
 * セッション確認
 */
export const checkSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    window.location.replace(`${PROD_URL}/login`)
    return null
  }
  return session
}

/**
 * サインアウト処理
 */
export const signOut = async () => {
  try {
    await supabase.auth.signOut()
  } finally {
    window.location.replace(PROD_URL)
  }
}

/**
 * 現在のユーザー取得
 */
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}