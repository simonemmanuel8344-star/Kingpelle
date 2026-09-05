import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const payload = {
    client_name: 'test',
    client_email: 'test@t.com',
    client_phone: '123',
    service_category: 'cat',
    project_title: 'title',
    project_description: 'desc',
    budget_range: '100',
    timeline: '1w',
    professional_id: 'd9b32c81-8079-4d20-b0ff-619f7fb09e74',
    professional_name: 'pro',
    attachment_url: '',
    cloud_link: '',
    status: 'pending',
    created_at: new Date().toISOString()
  };

  const res1 = await supabase.from('client_requests').insert([payload]).select();
  console.log("RES1:", res1.error);
  
  const escrowPayload = {
    service_order_id: null,
    client_id: 'client-guest',
    client_name: payload.client_name,
    professional_id: payload.professional_id,
    professional_name: payload.professional_name,
    title: payload.project_title,
    amount: 100000,
    commission_rate: 0.10,
    status: 'pending_payment'
  };
  
  const res2 = await supabase.from('escrow_projects').insert([escrowPayload]).select();
  console.log("RES2:", res2.error);
}
test();
