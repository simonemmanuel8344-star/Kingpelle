import { submitOrderToSupabase } from './src/lib/supabase';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

async function test() {
  const payload = {
    id: 'test',
    client_name: 'Real User',
    client_email: 'real@user.com',
    client_phone: '123',
    service_category: 'Web',
    project_title: 'UI Test Submit',
    project_description: 'Checking UI pipeline',
    budget_range: '1000',
    timeline: '1 week',
    professional_id: 'd9b32c81-8079-4d20-b0ff-619f7fb09e74',
    professional_name: 'Test Pro'
  };
  
  const res = await submitOrderToSupabase(payload);
  console.log("SUBMIT RESULT:", res);
}
test();
