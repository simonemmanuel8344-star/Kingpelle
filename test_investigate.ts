import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: cols } = await supabase.rpc('run_sql', { sql: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'escrow_projects';" }).catch(() => ({data: null}));
  console.log("Escrow Columns (RPC may fail):", cols);
  
  const { data: rows, error } = await supabase.from('escrow_projects').select('*').limit(5);
  console.log("Recent Escrow rows:", rows, error);
}
check();
