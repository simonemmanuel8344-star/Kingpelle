import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://cndijjjhyczocmphedmp.supabase.co';
const supabaseAnonKey = 'sb_publishable_2rwwPCeO4JumkrEZGQ0qpw_g25Opsmq';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const { data, error } = await supabase.rpc('get_schema_info'); // likely won't work
  const { data: d2, error: e2 } = await supabase.from('professionals').select('id, full_name, email, job_category, skills, picture, bio, location, years_of_experience').limit(1);
  console.log(JSON.stringify(d2, null, 2));
  console.log('Error:', e2);
}
test();
