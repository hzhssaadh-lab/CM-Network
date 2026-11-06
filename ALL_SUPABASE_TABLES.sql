-- ============================================================================
-- CM NETWORKS: COMPLETE ALL TABLES SETUP SCRIPT FOR SUPABASE
-- Run this entire script in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    uid TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    "photoURL" TEXT,
    balance NUMERIC DEFAULT 0,
    "usdtBalance" NUMERIC DEFAULT 0,
    "miningRate" NUMERIC DEFAULT 0.0020833333333333333,
    "miningSessionEndTime" BIGINT,
    "miningSessionStartTime" BIGINT,
    "referralCode" TEXT,
    "referredBy" TEXT,
    "referralCount" INTEGER DEFAULT 0,
    "joinDate" BIGINT,
    "dailyStreak" INTEGER DEFAULT 0,
    "kycStatus" TEXT DEFAULT 'unverified',
    role TEXT DEFAULT 'user',
    "isActive" BOOLEAN DEFAULT true,
    "totalMined" NUMERIC DEFAULT 0,
    "lastCheckIn" BIGINT,
    "lastSquadClaim" BIGINT,
    "deviceId" TEXT,
    "transactionsBlocked" BOOLEAN DEFAULT false,
    "squadId" TEXT,
    "cmAdsWatchedToday" INTEGER DEFAULT 0,
    "lastCmAdWatchDate" TEXT,
    "totalCmAdsWatched" INTEGER DEFAULT 0,
    "adsWatchedToday" INTEGER DEFAULT 0,
    "lastAdWatchDate" TEXT,
    "totalAdsWatched" INTEGER DEFAULT 0,
    "totalTasksCompleted" INTEGER DEFAULT 0,
    country TEXT,
    "isBlocked" BOOLEAN DEFAULT false,
    "paymentTxHash" TEXT,
    "paymentAmount" NUMERIC DEFAULT 0,
    "paymentWallet" TEXT,
    "autoKycStatus" TEXT,
    "livenessStatus" TEXT,
    "livenessScore" NUMERIC
);

-- Ensure all columns exist if users table was already created
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS uid TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "photoURL" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "usdtBalance" NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "miningRate" NUMERIC DEFAULT 0.0020833333333333333;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "miningSessionEndTime" BIGINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "miningSessionStartTime" BIGINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "referredBy" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "referralCount" INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "joinDate" BIGINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "dailyStreak" INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "kycStatus" TEXT DEFAULT 'unverified';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "totalMined" NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "lastCheckIn" BIGINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "lastSquadClaim" BIGINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "deviceId" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "transactionsBlocked" BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "squadId" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "cmAdsWatchedToday" INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "lastCmAdWatchDate" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "totalCmAdsWatched" INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "adsWatchedToday" INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "lastAdWatchDate" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "totalAdsWatched" INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "totalTasksCompleted" INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isBlocked" BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "paymentTxHash" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "paymentAmount" NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "paymentWallet" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "autoKycStatus" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "livenessStatus" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "livenessScore" NUMERIC;

-- ============================================================================
-- 2. TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    reward NUMERIC DEFAULT 0,
    type TEXT DEFAULT 'daily',
    url TEXT,
    "isActive" BOOLEAN DEFAULT true
);

-- ============================================================================
-- 3. COMPLETED TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public."completedTasks" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completedAt" BIGINT,
    status TEXT DEFAULT 'completed'
);

-- ============================================================================
-- 4. TASK CLAIMS TABLE (Admin approvals & verification)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public."taskClaims" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT,
    "userName" TEXT,
    "taskId" TEXT NOT NULL,
    "taskTitle" TEXT,
    reward NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    timestamp BIGINT
);

-- ============================================================================
-- 5. TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    timestamp BIGINT,
    status TEXT DEFAULT 'completed',
    "senderUid" TEXT,
    "receiverUid" TEXT,
    description TEXT
);

-- ============================================================================
-- 6. WITHDRAWALS TABLE (CM Coin Withdrawals)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "userEmail" TEXT,
    amount NUMERIC DEFAULT 0,
    wallet TEXT,
    status TEXT DEFAULT 'pending',
    "requestedAt" BIGINT,
    country TEXT,
    "transactionId" TEXT
);

-- ============================================================================
-- 7. WITHDRAWALS_USDT TABLE (USDT Withdrawals)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.withdrawals_usdt (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "userEmail" TEXT,
    amount NUMERIC DEFAULT 0,
    wallet TEXT,
    method TEXT DEFAULT 'USDT BEP-20',
    status TEXT DEFAULT 'pending',
    "requestedAt" BIGINT,
    country TEXT,
    "txHash" TEXT,
    "approvedAt" BIGINT,
    "rejectionReason" TEXT,
    "transactionId" TEXT
);

-- ============================================================================
-- 8. SQUADS TABLE (Mining Teams)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.squads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    "ownerId" TEXT NOT NULL,
    members INTEGER DEFAULT 1,
    "memberUids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalBalance" NUMERIC DEFAULT 0,
    "createdAt" BIGINT
);

-- ============================================================================
-- 9. SETTINGS TABLE (App & Admin Configurations, KYC Global Config)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    "showAds" BOOLEAN DEFAULT false,
    "adsterraSnippet" TEXT,
    "admobBannerId" TEXT,
    "maintenanceMode" BOOLEAN DEFAULT false,
    "maintenanceUntil" BIGINT
);

-- ============================================================================
-- 10. ADS_LOG TABLE (Adsterra & AdMob watch analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ads_log (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "adNetwork" TEXT,
    reward NUMERIC DEFAULT 0,
    timestamp BIGINT,
    country TEXT
);

-- ============================================================================
-- 11. KYC_VERIFICATIONS TABLE (Automatic BEP-20 + Biometric Liveness)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    payment_tx_hash TEXT,
    payment_amount NUMERIC(18, 6) DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'PAYMENT_REQUIRED',
    kyc_status TEXT NOT NULL DEFAULT 'NOT_STARTED',
    provider_reference TEXT,
    wallet_address TEXT,
    liveness_score NUMERIC(5, 2),
    liveness_status TEXT,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- INDEXES FOR HIGH PERFORMANCE & SECURITY
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users("referralCode");
CREATE INDEX IF NOT EXISTS idx_completed_tasks_user ON public."completedTasks"("userId");
CREATE INDEX IF NOT EXISTS idx_task_claims_user ON public."taskClaims"("userId");
CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON public.transactions("receiverUid");
CREATE INDEX IF NOT EXISTS idx_transactions_sender ON public.transactions("senderUid");
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON public.withdrawals("userId");
CREATE INDEX IF NOT EXISTS idx_withdrawals_usdt_user ON public.withdrawals_usdt("userId");
CREATE INDEX IF NOT EXISTS idx_ads_log_user ON public.ads_log("userId");
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user ON public.kyc_verifications(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_kyc_verifications_hash ON public.kyc_verifications(payment_tx_hash) WHERE payment_tx_hash IS NOT NULL AND payment_tx_hash <> '';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- ============================================================================
DO $$ 
DECLARE
    t text;
    tables text[] := ARRAY[
        'users', 
        'tasks', 
        'completedTasks', 
        'taskClaims', 
        'transactions', 
        'withdrawals', 
        'withdrawals_usdt', 
        'squads', 
        'settings', 
        'ads_log',
        'kyc_verifications'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Disable RLS initially to avoid PostgREST permission locks
        EXECUTE format('ALTER TABLE IF EXISTS public.%I DISABLE ROW LEVEL SECURITY;', t);
        
        -- Create open policy for reliable Web client read/write
        EXECUTE format('DROP POLICY IF EXISTS "public_access" ON public.%I;', t);
        EXECUTE format('CREATE POLICY "public_access" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t);
    END LOOP;
END $$;

-- ============================================================================
-- PERMISSIONS GRANTS FOR SUPABASE WEB CLIENTS
-- ============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Reload Supabase PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- ALL 11 TABLES ARE NOW COMPLETELY CONFIGURED AND READY IN SUPABASE!
-- ============================================================================
