
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  const { count, error } = await supabase.from('patients').select('*', { count: 'exact', head: true })
  if (error) {
    console.error('Error:', error)
    return
  }
  console.log('TOTAL_PATIENTS:', count)
}

checkData()
