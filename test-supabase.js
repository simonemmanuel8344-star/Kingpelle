import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://cndijjjhyczocmphedmp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZGlqampoeWN6b2NtcGhlZG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjMwOTYsImV4cCI6MjEwMzY5OTA5Nn0.Uyjxp6rA0GHfQ3ejbKLidvT2KSdNhMBImPyTp0HTyhw'
);
async function test() {
  const { data, error } = await supabase.from('projects').select('*').limit(1);
  console.log("Projects:", error ? error.message : "Exists");
  const { data: d2, error: e2 } = await supabase.from('services').select('*').limit(1);
  console.log("Services:", e2 ? e2.message : "Exists");
}
test();
