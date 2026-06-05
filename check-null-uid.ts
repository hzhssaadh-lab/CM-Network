import { supabase } from './src/lib/supabase';
async function run() {
    const { data, error } = await supabase.from('users').select('uid, UID').is('uid', null);
    console.log("Users with null uid:", data?.length, error);
}
run();
