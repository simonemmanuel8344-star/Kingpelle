import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://cndijjjhyczocmphedmp.supabase.co';
const supabaseAnonKey = 'sb_publishable_2rwwPCeO4JumkrEZGQ0qpw_g25Opsmq';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log(JSON.stringify(data, null, 2));
  console.log('Error:', error);
}
test();
