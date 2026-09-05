import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const escrowPayload = {
    client_id: 'client-guest',
    client_name: 'Simon Emmanuel',
    client_email: 'simonemmanuel8344@gmail.com',
    professional_id: 'pro-test',
    professional_name: 'Simon (Pro)',
    professional_email: 'simonemmanuel8344@gmail.com',
    title: 'Database Sync Verification Test',
    amount: 150000,
    commission_rate: 0.10,
    status: 'pending_acceptance'
  };
  const { data, error } = await supabase.from('escrow_projects').insert([escrowPayload]).select();
  console.log("INSERT RES:", data, error);
}
test();
