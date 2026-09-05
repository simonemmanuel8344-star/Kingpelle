import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const payload = {
    client_name: 'Test Client',
    client_email: 'test@example.com',
    client_phone: '123456789',
    service_category: 'Web Dev',
    project_title: 'Test Project via Agent',
    project_description: 'Checking if it works',
    budget_range: '100-500',
    timeline: '1 week',
    professional_id: 'd9b32c81-8079-4d20-b0ff-619f7fb09e74',
    professional_name: 'Pro User',
    status: 'pending',
  };
  const { data: reqData, error: reqErr } = await supabase.from('client_requests').insert([payload]).select();
  console.log("CLIENT REQUESTS INSERT:", reqData, reqErr);
  
  const escrowPayload = {
    client_id: 'client-guest',
    client_name: 'Test Client',
    professional_id: 'd9b32c81-8079-4d20-b0ff-619f7fb09e74',
    title: 'Test Project via Agent',
    amount: 500,
    commission_rate: 0.10,
    status: 'pending_payment'
  };
  const { data: escData, error: escErr } = await supabase.from('escrow_projects').insert([escrowPayload]).select();
  console.log("ESCROW INSERT:", escData, escErr);
}
test();
