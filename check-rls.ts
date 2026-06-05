import { supabase } from './src/lib/supabase';
async function test() {
  const { data, error } = await supabase.from('users').select('*').eq('uid', 'f95ec976-9a38-4707-9764-af0e8c5f05b8');
  console.log("Q1:", data, error);
}
test();
