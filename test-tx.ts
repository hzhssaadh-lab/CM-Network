import { supabase } from './src/lib/supabase';
async function test() {
  const { data, error } = await supabase.from('transactions').insert([{
    id: 'test_tx_1',
    type: 'ad_reward',
    amount: 0.01,
    timestamp: Date.now(),
    status: 'completed',
    receiverUid: 'test_user_id',
    senderUid: 'system',
    description: `test`
  }]);
  console.log("Tx result:", data, "Error:", error);
}
test();
