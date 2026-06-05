import { supabase } from './src/lib/supabase';
async function test() {
  const sUserId = 'cb41bbf6-24b2-4d95-801a-f9379f4b3989';
  const oldUid = 'WHATEVER-OLD-UID';
  
  // Let's just find the user with this email to see its ACTUAL uid in the DB
  const { data } = await supabase.from('users').select('*').eq('email', 'theramboking786@gmail.com');
  console.log("DB User:", data);
}
test();
