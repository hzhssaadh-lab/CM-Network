import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://esyqgfybykbjbjagwkcs.supabase.co';
const supabaseAnonKey = 'sb_publishable_ga39dSKPwJvJBsQppSQC9g_s0kPELWg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Querying non-empty old columns from users table...');
  
  const { data: allUsers, error } = await supabase
    .from('users')
    .select('*')
    .limit(100);

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Total users fetched: ${allUsers?.length}`);
  if (!allUsers || allUsers.length === 0) {
    console.log('No users found.');
    return;
  }

  // Let's summarize the column distribution with actual examples
  const sampleWithCoins = allUsers.filter(u => {
    const cmCoinsVal = u['CM Coins'] || u['cm_coins'] || u['balance'] || 0;
    const usdtVal = u['USDT'] || u['usdt'] || u['usdtBalance'] || u['usdtbalance'] || 0;
    const refCountVal = u['Ref Count'] || u['ref_count'] || u['referralCount'] || 0;
    return Number(cmCoinsVal) > 0 || Number(usdtVal) > 0 || Number(refCountVal) > 0;
  });

  console.log(`\nFound ${sampleWithCoins.length} users with non-zero coins, usdt, or ref counts.`);
  
  if (sampleWithCoins.length > 0) {
    console.log('\nSample user with coins/ussd/refs:');
    const u = sampleWithCoins[0];
    console.log({
      UID: u.UID,
      uid: u.uid,
      Name: u.Name,
      name: u.name,
      Email: u.Email,
      email: u.email,
      'CM Coins': u['CM Coins'],
      cm_coins: u.cm_coins,
      balance: u.balance,
      USDT: u.USDT,
      usdt: u.usdt,
      usdtbalance: u.usdtbalance,
      usdtBalance: u.usdtBalance,
      'Referral Code': u['Referral Code'],
      referralCode: u.referralCode,
      referral_code: u.referral_code,
      'Referred By': u['Referred By'],
      referredBy: u.referredBy,
      referred_by: u.referred_by,
      'Ref Count': u['Ref Count'],
      ref_count: u.ref_count,
      referralCount: u.referralCount,
      'Joined At': u['Joined At'],
      joinDate: u.joinDate
    });
  } else {
    console.log('\nAll 100 users fetched have 0 coins, usdt, and ref counts in all variants. Let us inspect first 10 users overall keys to see if they have any content.');
    for (let i = 0; i < Math.min(10, allUsers.length); i++) {
       const u = allUsers[i];
       console.log(`User ${i}: UID=${u.UID}, Name=${u.Name}, name=${u.name}, CM Coins=${u['CM Coins']}, cm_coins=${u.cm_coins}, balance=${u.balance}`);
    }
  }
}

main().catch(console.error);
