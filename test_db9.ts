import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
     const dummy = { client_id: '1', professional_id: '2', title: 't', amount: 1, commission_rate: 0 };
     const { error } = await supabase.from('escrow_projects').insert([dummy]);
     console.log("INSERT ERROR:", error);
}
test();
