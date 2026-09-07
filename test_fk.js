import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://cndijjjhyczocmphedmp.supabase.co', 'sb_publishable_2rwwPCeO4JumkrEZGQ0qpw_g25Opsmq');

async function testFK() {
  const { data, error } = await supabase.from('job_applications').insert([{
    id: '00000000-0000-0000-0000-000000000002',
    job_id: null,
    full_name: 'Test Candidate',
    email: 'test@candidate.com'
  }]).select();
  console.log('job_applications test:', error ? error.message : 'OK', data);
}
testFK();
