import { createClient } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

// 環境定数
const SUPABASE_URL = 'https://inichkwyezruanpovcff.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaWNoa3d5ZXpydWFucG92Y2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODgxODgsImV4cCI6MjA1MDM2NDE4OH0.Vy2HWo3LrQBZPgTjaRr0-6ommN90Xh9uUizKUhQllvI'
const PROD_URL = 'https://creative-ai-tool.vercel.app'

// Supabaseクライアントの初期化
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 認証コンテキストの作成
const AuthContext = createContext({})

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // セッションの確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 認証状態の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// 認証フック
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Google認証
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${PROD_URL}/auth/callback`
    }
  })
  if (error) throw error
  return data
}

// サインアウト
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}