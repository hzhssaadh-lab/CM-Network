import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('users').select('cmAdsWatchedToday, adsWatchedToday, totalAdsWatched').limit(1);
  console.log("Data:", data, "Error:", error);
}
test();
