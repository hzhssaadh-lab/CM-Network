-- Run this query in your Supabase SQL Editor to move data from the old columns to the new columns
UPDATE public.users 
SET 
  "balance" = COALESCE("cm_coins"::numeric, "balance", 0),
  "referralCode" = COALESCE("referral_code"::text, "referralCode"),
  "referredBy" = COALESCE("referred_by"::text, "referredBy"),
  "referralCount" = COALESCE("ref_count"::integer, "referralCount", 0),
  "joinDate" = COALESCE((EXTRACT(EPOCH FROM "joined_at") * 1000)::bigint, "joinDate"),
  "deviceId" = COALESCE("deviceid"::text, "deviceId"),
  "kycStatus" = COALESCE("kycstatus"::text, "kycStatus", 'pending'),
  "totalTasksCompleted" = COALESCE("totaltaskscompleted"::integer, "totalTasksCompleted", 0),
  "usdtBalance" = COALESCE("usdtbalance"::numeric, "usdt"::numeric, "usdtBalance", 0),
  "transactionsBlocked" = COALESCE("transactionsblocked"::boolean, "transactionsBlocked", false);
