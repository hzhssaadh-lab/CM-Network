import { supabase } from './src/lib/supabase';
async function test() {
  const { data, error } = await supabase.from('users').select('uid').limit(10000);
  console.log("Users fetched with 10k limit:", data?.length, error);
}
test();
