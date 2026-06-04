-- Run this query in your Supabase SQL Editor to move data from the old columns to the new columns

-- 1. Safely rename "UID" to "uid" if the lowercase one does not exist yet
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'UID'
  ) AND NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'uid'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN "UID" TO "uid";
  END IF;
END $$;

-- 2. Ensure "uid" column exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "uid" text;

-- 3. Move data from capitalized / spaced legacy columns to correct standard ones
DO $$
BEGIN
  -- If "UID" exists, we can dynamically run an update:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='UID') THEN
    EXECUTE 'UPDATE public.users SET "uid" = COALESCE("uid", "UID") WHERE "UID" IS NOT NULL';
  END IF;

  -- If "Email" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Email') THEN
    EXECUTE 'UPDATE public.users SET "email" = COALESCE("email", "Email", '''')';
  END IF;

  -- If "Name" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Name') THEN
    EXECUTE 'UPDATE public.users SET "name" = COALESCE("name", "Name", ''User'')';
  END IF;

  -- If "Country" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Country') THEN
    EXECUTE 'UPDATE public.users SET "country" = COALESCE("country", "Country")';
  END IF;

  -- If "CM Coins" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='CM Coins') THEN
    EXECUTE 'UPDATE public.users SET "balance" = COALESCE("balance", "CM Coins"::numeric, 0)';
  END IF;

  -- If "cm_coins" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='cm_coins') THEN
    EXECUTE 'UPDATE public.users SET "balance" = COALESCE("balance", "cm_coins"::numeric, 0)';
  END IF;

  -- If "USDT" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='USDT') THEN
    EXECUTE 'UPDATE public.users SET "usdtBalance" = COALESCE("usdtBalance", "USDT"::numeric, 0)';
  END IF;

  -- If "usdt" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='usdt') THEN
    EXECUTE 'UPDATE public.users SET "usdtBalance" = COALESCE("usdtBalance", "usdt"::numeric, 0)';
  END IF;

  -- If "usdtbalance" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='usdtbalance') THEN
    EXECUTE 'UPDATE public.users SET "usdtBalance" = COALESCE("usdtBalance", "usdtbalance"::numeric, 0)';
  END IF;

  -- If "Referral Code" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Referral Code') THEN
    EXECUTE 'UPDATE public.users SET "referralCode" = COALESCE("referralCode", "Referral Code")';
  END IF;

  -- If "referral_code" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='referral_code') THEN
    EXECUTE 'UPDATE public.users SET "referralCode" = COALESCE("referralCode", "referral_code")';
  END IF;

  -- If "Referred By" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Referred By') THEN
    EXECUTE 'UPDATE public.users SET "referredBy" = COALESCE("referredBy", "Referred By")';
  END IF;

  -- If "referred_by" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='referred_by') THEN
    EXECUTE 'UPDATE public.users SET "referredBy" = COALESCE("referredBy", "referred_by")';
  END IF;

  -- If "Ref Count" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Ref Count') THEN
    EXECUTE 'UPDATE public.users SET "referralCount" = COALESCE("referralCount", "Ref Count"::integer, 0)';
  END IF;

  -- If "ref_count" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='ref_count') THEN
    EXECUTE 'UPDATE public.users SET "referralCount" = COALESCE("referralCount", "ref_count"::integer, 0)';
  END IF;

  -- If "Joined At" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Joined At') THEN
    EXECUTE 'UPDATE public.users SET "joinDate" = COALESCE("joinDate", (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint)';
  END IF;

  -- If "joined_at" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='joined_at') THEN
    EXECUTE 'UPDATE public.users SET "joinDate" = COALESCE("joinDate", (EXTRACT(EPOCH FROM "joined_at") * 1000)::bigint)';
  END IF;

  -- If "deviceid" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='deviceid') THEN
    EXECUTE 'UPDATE public.users SET "deviceId" = COALESCE("deviceId", "deviceid")';
  END IF;

  -- If "kycstatus" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='kycstatus') THEN
    EXECUTE 'UPDATE public.users SET "kycStatus" = COALESCE("kycStatus", "kycstatus")';
  END IF;

  -- If "totaltaskscompleted" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='totaltaskscompleted') THEN
    EXECUTE 'UPDATE public.users SET "totalTasksCompleted" = COALESCE("totalTasksCompleted", "totaltaskscompleted"::integer, 0)';
  END IF;

  -- If "transactionsblocked" exists:
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='transactionsblocked') THEN
    EXECUTE 'UPDATE public.users SET "transactionsBlocked" = COALESCE("transactionsBlocked", "transactionsblocked"::boolean, false)';
  END IF;
  
END $$;
