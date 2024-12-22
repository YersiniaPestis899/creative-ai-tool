import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 値の検証とデバッグ
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials:', {
    urlExists: !!supabaseUrl,
    keyExists: !!supabaseKey
  })
  throw new Error('Required Supabase credentials are missing')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`
    }
  }
})

// 接続テスト
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('story_settings')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
    } else {
      console.log('Supabase connection successful')
    }
  } catch (err) {
    console.error('Supabase connection test error:', err)
  }
}

testConnection()

export { supabase }