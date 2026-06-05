import { supabase } from './src/lib/supabase';
async function test() {
  const { count: uCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  console.log("Total Users in DB:", uCount);

  const { count: tCount } = await supabase.from('taskClaims').select('*', { count: 'exact', head: true });
  console.log("Total taskClaims in DB:", tCount);
}
test();
