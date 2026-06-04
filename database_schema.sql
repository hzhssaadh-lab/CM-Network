-- Run this in your Supabase SQL Editor to ensure all required columns exist

-- Add missing columns to the users table
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
