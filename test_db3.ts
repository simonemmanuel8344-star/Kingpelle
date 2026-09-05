import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: esc, error: e2 } = await supabase.from('escrow_projects').select('*');
  console.log("ESCROW PROJECTS DATA:", esc);
}
test();
