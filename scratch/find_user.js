
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function getUserId() {
  const { data, error } = await supabase.from('patients').select('user_id').limit(1)
  if (error) {
    console.error('Error:', error)
    return
  }
  if (data && data.length > 0) {
    console.log('USER_ID:', data[0].user_id)
  } else {
    console.log('No patients found to extract user_id')
  }
}

getUserId()
