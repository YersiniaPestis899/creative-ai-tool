import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://inichkwyezruanpovcff.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaWNoa3d5ZXpydWFucG92Y2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDMyMzIxNjgsImV4cCI6MjAxODgwODE2OH0.zDhPOJpxmCcgvq1BUvgSOr86h5kjYgERD5cL_Dw5NFk'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
})