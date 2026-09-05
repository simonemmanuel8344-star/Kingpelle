import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const { data: cr } = await supabase.from('client_requests').select('*');
  console.log("CLIENT REQUESTS DATA:", cr);
  const { data: so } = await supabase.from('service_orders').select('*');
  console.log("SERVICE ORDERS DATA:", so);
}
test();
