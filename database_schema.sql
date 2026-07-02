-- Run this in your Supabase SQL Editor to ensure all required columns exist and data is migrated correctly.

-- 1. Ensure "uid" column exists and is defined
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "uid" text;

-- 2. Add other missing columns to the users table
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
ADD COLUMN IF NOT EXISTS "cmAdsWatchedToday" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lastCmAdWatchDate" text,
ADD COLUMN IF NOT EXISTS "totalCmAdsWatched" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "adsWatchedToday" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lastAdWatchDate" text,
ADD COLUMN IF NOT EXISTS "totalAdsWatched" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "totalTasksCompleted" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "country" text,
ADD COLUMN IF NOT EXISTS "isBlocked" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "usdtBalance" numeric DEFAULT 0;

-- 3. Dynamic parse-safe data migration steps.
-- Every block uses dynamic SQL execution so that it NEVER fails at parse-time.

-- Migrate UID
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='UID') THEN
    EXECUTE 'UPDATE public.users SET "uid" = "UID" WHERE "uid" IS NULL AND "UID" IS NOT NULL';
  END IF;
END $$;

-- Migrate Email
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Email') THEN
    EXECUTE 'UPDATE public.users SET "email" = COALESCE("email", "Email") WHERE "Email" IS NOT NULL';
  END IF;
END $$;

-- Migrate Name
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Name') THEN
    EXECUTE 'UPDATE public.users SET "name" = COALESCE("name", "Name") WHERE "Name" IS NOT NULL';
  END IF;
END $$;

-- Migrate Country
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Country') THEN
    EXECUTE 'UPDATE public.users SET "country" = COALESCE("country", "Country") WHERE "Country" IS NOT NULL';
  END IF;
END $$;

-- Migrate balance from legacy 'CM Coins'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='CM Coins') THEN
    EXECUTE 'UPDATE public.users SET "balance" = COALESCE("balance", "CM Coins"::numeric) WHERE "CM Coins" IS NOT NULL';
  END IF;
END $$;

-- Migrate balance from legacy 'cm_coins'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='cm_coins') THEN
    EXECUTE 'UPDATE public.users SET "balance" = COALESCE("balance", "cm_coins"::numeric) WHERE "cm_coins" IS NOT NULL';
  END IF;
END $$;

-- Migrate usdtBalance from legacy 'USDT'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='USDT') THEN
    EXECUTE 'UPDATE public.users SET "usdtBalance" = COALESCE("usdtBalance", "USDT"::numeric) WHERE "USDT" IS NOT NULL';
  END IF;
END $$;

-- Migrate usdtBalance from legacy 'usdt'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='usdt') THEN
    EXECUTE 'UPDATE public.users SET "usdtBalance" = COALESCE("usdtBalance", "usdt"::numeric) WHERE "usdt" IS NOT NULL';
  END IF;
END $$;

-- Migrate usdtBalance from legacy 'usdtbalance'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='usdtbalance') THEN
    EXECUTE 'UPDATE public.users SET "usdtBalance" = COALESCE("usdtBalance", "usdtbalance"::numeric) WHERE "usdtbalance" IS NOT NULL';
  END IF;
END $$;

-- Migrate referralCode from legacy 'Referral Code'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Referral Code') THEN
    EXECUTE 'UPDATE public.users SET "referralCode" = COALESCE("referralCode", "Referral Code") WHERE "Referral Code" IS NOT NULL';
  END IF;
END $$;

-- Migrate referralCode from legacy 'referral_code'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='referral_code') THEN
    EXECUTE 'UPDATE public.users SET "referralCode" = COALESCE("referralCode", "referral_code") WHERE "referral_code" IS NOT NULL';
  END IF;
END $$;

-- Migrate referredBy from legacy 'Referred By'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Referred By') THEN
    EXECUTE 'UPDATE public.users SET "referredBy" = COALESCE("referredBy", "Referred By") WHERE "Referred By" IS NOT NULL';
  END IF;
END $$;

-- Migrate referredBy from legacy 'referred_by'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='referred_by') THEN
    EXECUTE 'UPDATE public.users SET "referredBy" = COALESCE("referredBy", "referred_by") WHERE "referred_by" IS NOT NULL';
  END IF;
END $$;

-- Migrate referralCount from legacy 'Ref Count'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Ref Count') THEN
    EXECUTE 'UPDATE public.users SET "referralCount" = COALESCE("referralCount", "Ref Count"::integer) WHERE "Ref Count" IS NOT NULL';
  END IF;
END $$;

-- Migrate referralCount from legacy 'ref_count'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='ref_count') THEN
    EXECUTE 'UPDATE public.users SET "referralCount" = COALESCE("referralCount", "ref_count"::integer) WHERE "ref_count" IS NOT NULL';
  END IF;
END $$;

-- Migrate joinDate from legacy 'Joined At'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='Joined At') THEN
    UPDATE public.users SET "joinDate" = COALESCE("joinDate", EXTRACT(EPOCH FROM to_timestamp("Joined At", 'DD/MM/YYYY, HH24:MI:SS'))::bigint * 1000) WHERE "Joined At" IS NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  UPDATE public.users SET "joinDate" = COALESCE("joinDate", (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint);
END $$;

-- Migrate joinDate from legacy 'joined_at'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='joined_at') THEN
    EXECUTE 'UPDATE public.users SET "joinDate" = COALESCE("joinDate", (EXTRACT(EPOCH FROM "joined_at") * 1000)::bigint) WHERE "joined_at" IS NOT NULL';
  END IF;
END $$;

-- Migrate deviceId from legacy 'deviceid'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='deviceid') THEN
    EXECUTE 'UPDATE public.users SET "deviceId" = COALESCE("deviceId", "deviceid") WHERE "deviceid" IS NOT NULL';
  END IF;
END $$;

-- Migrate kycStatus from legacy 'kycstatus'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='kycstatus') THEN
    EXECUTE 'UPDATE public.users SET "kycStatus" = COALESCE("kycStatus", "kycstatus") WHERE "kycstatus" IS NOT NULL';
  END IF;
END $$;

-- Migrate totalTasksCompleted from legacy 'totaltaskscompleted'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='totaltaskscompleted') THEN
    EXECUTE 'UPDATE public.users SET "totalTasksCompleted" = COALESCE("totalTasksCompleted", "totaltaskscompleted"::integer) WHERE "totaltaskscompleted" IS NOT NULL';
  END IF;
END $$;

-- Migrate transactionsBlocked from legacy 'transactionsblocked'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='transactionsblocked') THEN
    EXECUTE 'UPDATE public.users SET "transactionsBlocked" = COALESCE("transactionsBlocked", "transactionsblocked"::boolean) WHERE "transactionsblocked" IS NOT NULL';
  END IF;
END $$;

-- 4. Create other missing tables
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

-- DISABLE ROW LEVEL SECURITY (RLS) FOR THE TABLES
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

-- Reload the Supabase PostgREST Cache so the 'uid' column is immediately visible
NOTIFY pgrst, 'reload schema';
