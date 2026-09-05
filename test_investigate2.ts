import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);

async function check() {
  const { data: rows, error } = await supabase.from('escrow_projects').select('*').limit(5);
  console.log("Recent Escrow rows:", rows, error);
}
check();
