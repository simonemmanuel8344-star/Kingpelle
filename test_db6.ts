import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const { data, error } = await supabase.rpc('run_sql', { sql: "SELECT * FROM information_schema.key_column_usage WHERE table_name = 'escrow_projects';" });
  console.log("FK:", data, error);
}
test();
