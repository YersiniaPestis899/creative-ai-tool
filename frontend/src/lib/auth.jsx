import { createClient } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

const SUPABASE_URL = 'https://inichkwyezruanpovcff.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaWNoa3d5ZXpydWFucG92Y2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODgxODgsImV4cCI6MjA1MDM2NDE4OH0.Vy2HWo3LrQBZPgTjaRr0-6ommN90Xh9uUizKUhQllvI'

// Supabaseクライアントの強化設定
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'creative-ai-auth',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    debug: true // 開発中は有効化
  },
})

const AuthContext = createContext({})

// デバッグ用ユーティリティ
const logAuthEvent = (event, data) => {
  console.log(`[Auth Event] ${event}:`, data)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // セッション初期化関数
    const initializeSession = async () => {
      try {
        logAuthEvent('Initializing session', null)
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (initialSession) {
          logAuthEvent('Initial session found', initialSession)
          setSession(initialSession)
          setUser(initialSession.user)
        } else {
          logAuthEvent('No initial session found', null)
        }
      } catch (error) {
        console.error('Session initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    // セッション初期化
    initializeSession()

    // 認証状態変更監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      logAuthEvent('Auth state change', { event, session: currentSession })
      
      if (currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)
      } else {
        setSession(null)
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      logAuthEvent('Cleanup subscription', null)
      subscription?.unsubscribe()
    }
  }, [])

  // トークン更新処理
  useEffect(() => {
    const refreshToken = async () => {
      try {
        if (session?.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000)
          const now = new Date()
          const timeUntilExpiry = expiresAt - now

          if (timeUntilExpiry < 60000) { // 1分以内に期限切れ
            logAuthEvent('Refreshing token', null)
            const { data: { session: newSession }, error } = await supabase.auth.refreshSession()
            if (error) throw error
            if (newSession) {
              setSession(newSession)
              setUser(newSession.user)
            }
          }
        }
      } catch (error) {
        console.error('Token refresh error:', error)
      }
    }

    const interval = setInterval(refreshToken, 30000) // 30秒ごとにチェック
    return () => clearInterval(interval)
  }, [session])

  // 認証状態のデバッグ情報
  useEffect(() => {
    console.log('Current auth state:', {
      user: user?.id,
      sessionExists: !!session,
      loading
    })
  }, [user, session, loading])

  const value = {
    session,
    user,
    loading,
    signInWithGoogle,
    signOut,
    refreshSession: async () => {
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      return newSession
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const signInWithGoogle = async () => {
  try {
    logAuthEvent('Initiating Google sign in', null)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        },
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) throw error
    logAuthEvent('Google sign in success', data)
    return data
  } catch (error) {
    console.error('Google sign in error:', error)
    throw error
  }
}

export const signOut = async () => {
  try {
    logAuthEvent('Initiating sign out', null)
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    logAuthEvent('Sign out success', null)
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}