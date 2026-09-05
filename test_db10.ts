import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const dummy = { 
    client_id: 'test-guest', 
    professional_id: 'test-pro', 
    title: 'Post-SQL Verification', 
    amount: 1, 
    commission_rate: 0,
    client_email: 'test@example.com'
  };
  const { data, error } = await supabase.from('escrow_projects').insert([dummy]).select();
  console.log("INSERT RES:", data, error);
  if (data && data.length > 0) {
    const { error: delErr } = await supabase.from('escrow_projects').delete().eq('id', data[0].id);
    console.log("DELETE RES:", delErr);
  }
}
test();
