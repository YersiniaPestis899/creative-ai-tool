import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

const getRedirectUrl = () => {
  const isProd = import.meta.env.PROD
  return isProd 
    ? 'https://creative-ai-tool.vercel.app/auth/callback'
    : 'http://localhost:3000/auth/callback'
}

export const signInWithGoogle = async () => {
  try {
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

    if (error) throw error
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