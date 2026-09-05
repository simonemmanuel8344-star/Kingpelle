import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clean() {
  await supabase.from('client_requests').delete().eq('project_title', 'Test Project via Agent');
  await supabase.from('escrow_projects').delete().eq('title', 'Test Project via Agent');
  console.log("Cleanup complete");
}
clean();
