import { supabase } from './src/lib/supabase';
async function test() {
  const { data, error } = await supabase.from('ads_log').insert([{
    id: 'test_log_1',
    userId: 'test_user_id',
    adNetwork: 'Monetag (CM)',
    reward: 0.01,
    timestamp: Date.now(),
    country: 'Unknown'
  }]);
  console.log("Insert result:", data, "Error:", error);
}
test();
