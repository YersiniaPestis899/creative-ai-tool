import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const PRODUCTION_URL = 'https://creative-ai-tool.vercel.app'

// 環境に基づいたURLの取得
const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    return PRODUCTION_URL
  }
  return 'http://localhost:3000'
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export const signInWithGoogle = async () => {
  try {
    console.log('Current environment:', import.meta.env.MODE)
    console.log('Base URL:', getBaseUrl())

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: `${getBaseUrl()}/auth/callback`
      }
    })

    if (error) {
      console.error('Sign-in error:', error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // 環境に応じたリダイレクト
    window.location.href = getBaseUrl()
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session?.user || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}