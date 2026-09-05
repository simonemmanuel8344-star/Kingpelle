import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://cndijjjhyczocmphedmp.supabase.co';
const supabaseAnonKey = 'sb_publishable_2rwwPCeO4JumkrEZGQ0qpw_g25Opsmq';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const { data, error } = await supabase.from('professionals').insert([{ id: 'c9f80a42-70b5-4b05-a330-8041fc94d01f' }]).select();
  console.log(JSON.stringify(data, null, 2));
  console.log('Error:', error);
}
test();
