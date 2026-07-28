import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const userId = 'ghon9001@gmail.com';
  const { data, error } = await supabase.from('users').select('*').or(`uid.eq.${userId},UID.eq.${userId}`);
  console.log('Error:', error);
}
test();
