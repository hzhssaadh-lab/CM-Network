import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://esyqgfybykbjbjagwkcs.supabase.co';
const supabaseAnonKey = 'sb_publishable_ga39dSKPwJvJBsQppSQC9g_s0kPELWg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('settings').update({ maintenanceMode: true }).eq('id', 'app');
  console.log("Update settings:", data, error);
}
run();
