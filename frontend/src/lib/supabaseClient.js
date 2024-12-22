import { createClient } from '@supabase/supabase-js'

// Viteの環境変数参照方法に修正
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 初期化前の値検証
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  throw new Error(`Supabase credentials are missing:
    URL: ${supabaseUrl ? 'exists' : 'missing'}
    Key: ${supabaseKey ? 'exists' : 'missing'}
  `)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export { supabase }