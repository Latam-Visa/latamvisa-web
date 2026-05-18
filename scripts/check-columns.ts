import { supabaseAdmin } from '../lib/supabase/admin'

async function checkColumns() {
  const { data, error } = await supabaseAdmin.from('visa_applications_usa').select('*').limit(1)
  console.log('Error from select *:', error)
  
  // To get columns from empty table, we insert an invalid row and see what columns exist in the response
  // Or we can just try selecting other common names:
  const queries = ['form_data', 'application_data', 'json_data', 'step1_contact']
  for (const q of queries) {
    const { error: e } = await supabaseAdmin.from('visa_applications_usa').select(q).limit(1)
    if (!e) console.log('Found column:', q)
  }
}

checkColumns().catch(console.error)
