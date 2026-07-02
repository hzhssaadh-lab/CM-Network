import { supabase } from './src/lib/supabase';
async function test() {
  const { data, error } = await supabase.from('ads_log').select('*').limit(5);
  console.log("Ads Log:", data, "Error:", error);
}
test();
