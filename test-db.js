import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { error } = await supabase.from('users').update({
    totalAdsWatched: 1,
    totalCmAdsWatched: 1
  }).eq('uid', 'test');
  console.log("Error:", error);
}
test();
