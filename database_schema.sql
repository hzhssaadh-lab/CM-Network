-- Run this in your Supabase SQL Editor to ensure all required columns exist

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

-- 2. Ensure "uid" column exists and is defined
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "uid" text;

-- 3. Add missing columns to the users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS "photoURL" text,
ADD COLUMN IF NOT EXISTS "balance" numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS "miningRate" numeric DEFAULT 0.0020833333333333333,
ADD COLUMN IF NOT EXISTS "miningSessionEndTime" bigint,
ADD COLUMN IF NOT EXISTS "miningSessionStartTime" bigint,
ADD COLUMN IF NOT EXISTS "referralCode" text,
ADD COLUMN IF NOT EXISTS "referredBy" text,
ADD COLUMN IF NOT EXISTS "referralCount" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "joinDate" bigint,
ADD COLUMN IF NOT EXISTS "dailyStreak" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "kycStatus" text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS "totalMined" numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lastCheckIn" bigint,
ADD COLUMN IF NOT EXISTS "lastSquadClaim" bigint,
ADD COLUMN IF NOT EXISTS "deviceId" text,
ADD COLUMN IF NOT EXISTS "transactionsBlocked" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "squadId" text,
ADD COLUMN IF NOT EXISTS "adsWatchedToday" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lastAdWatchDate" text,
ADD COLUMN IF NOT EXISTS "totalAdsWatched" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "totalTasksCompleted" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "country" text,
ADD COLUMN IF NOT EXISTS "isBlocked" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "usdtBalance" numeric DEFAULT 0;

-- 4. Safe data migration query to copy legacy or custom imported data into correct lowercase columns
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

-- Create other missing tables
CREATE TABLE IF NOT EXISTS public.tasks (
  id text PRIMARY KEY,
  title text,
  reward numeric,
  type text,
  url text,
  "isActive" boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public."completedTasks" (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text,
  "taskId" text,
  "completedAt" bigint,
  status text
);

CREATE TABLE IF NOT EXISTS public."taskClaims" (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text,
  "userEmail" text,
  "userName" text,
  "taskId" text,
  "taskTitle" text,
  reward numeric,
  status text,
  timestamp bigint
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type text,
  amount numeric,
  timestamp bigint,
  status text,
  "senderUid" text,
  "receiverUid" text,
  description text
);

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text,
  "userName" text,
  "userEmail" text,
  amount numeric,
  wallet text,
  status text,
  "requestedAt" bigint,
  country text,
  "transactionId" text
);

CREATE TABLE IF NOT EXISTS public.withdrawals_usdt (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text,
  "userName" text,
  "userEmail" text,
  amount numeric,
  wallet text,
  status text,
  "requestedAt" bigint,
  country text,
  "txHash" text,
  "approvedAt" bigint,
  "rejectionReason" text,
  "transactionId" text
);

CREATE TABLE IF NOT EXISTS public.squads (
  id text PRIMARY KEY,
  name text,
  description text,
  "ownerId" text,
  members integer DEFAULT 1,
  "memberUids" text[],
  "totalBalance" numeric DEFAULT 0,
  "createdAt" bigint
);

CREATE TABLE IF NOT EXISTS public.settings (
  id text PRIMARY KEY,
  "showAds" boolean DEFAULT false,
  "adsterraSnippet" text,
  "admobBannerId" text,
  "maintenanceMode" boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.ads_log (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text,
  "adNetwork" text,
  reward numeric,
  timestamp bigint,
  country text
);

-- DISABLE ROW LEVEL SECURITY (RLS) FOR THE NEW TABLES
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."completedTasks" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."taskClaims" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals_usdt DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_log DISABLE ROW LEVEL SECURITY;
