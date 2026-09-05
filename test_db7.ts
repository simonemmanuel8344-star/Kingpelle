import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const escrowPayload = {
    client_id: 'client-guest',
    client_name: 'test',
    professional_id: 'd9b32c81-8079-4d20-b0ff-619f7fb09e74',
    professional_name: 'pro',
    title: 'title',
    amount: parseInt('Flexible'.replace(/[^0-9]/g, '') || '100000'),
    commission_rate: 0.10,
    status: 'pending_payment'
  };
  const { error } = await supabase.from('escrow_projects').insert([escrowPayload]);
  console.log("INSERT ERROR:", error);
  console.log("AMOUNT PARSED:", parseInt('Flexible'.replace(/[^0-9]/g, '') || '100000'));
}
test();
