import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const appUrl = import.meta.env.VITE_APP_URL || window.location.origin

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

const getRedirectUrl = () => {
  // 本番環境とローカル環境の判定
  const baseUrl = import.meta.env.DEV ? 'http://localhost:3000' : appUrl
  return `${baseUrl}/auth/callback`
}

export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in process...')
    console.log('Environment:', import.meta.env.MODE)
    console.log('Redirect URL:', getRedirectUrl())
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: getRedirectUrl()
      }
    })

    if (error) {
      console.error('Sign-in error:', error)
      throw error
    }
    
    console.log('Sign-in successful:', data)
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
    
    window.location.href = appUrl
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