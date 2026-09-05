import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://cndijjjhyczocmphedmp.supabase.co';
const supabaseAnonKey = 'sb_publishable_2rwwPCeO4JumkrEZGQ0qpw_g25Opsmq';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const { data: d2, error: e2 } = await supabase.from('projects').select('*').limit(1);
  console.log(JSON.stringify(d2, null, 2));
  console.log('Error:', e2);
}
test();
