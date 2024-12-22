import { createClient } from '@supabase/supabase-js'
import { getEnvironmentUrl, ensureProductionUrl } from '../utils/environment'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in process...')
    const redirectUrl = ensureProductionUrl('/auth/callback')
    console.log('Redirect URL:', redirectUrl)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: redirectUrl
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
    
    window.location.href = getEnvironmentUrl()
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