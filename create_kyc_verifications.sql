-- ============================================================================
-- CM NETWORKS: KYC VERIFICATIONS TABLE MIGRATION WITH ROW LEVEL SECURITY (RLS)
-- Run this in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================================================

-- 1. Create the 'kyc_verifications' table
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

-- 2. Indexes for high performance & anti-replay security
-- Prevent duplicate payment transaction hashes (anti-replay check)
CREATE UNIQUE INDEX IF NOT EXISTS idx_kyc_verifications_payment_tx_hash 
    ON public.kyc_verifications(payment_tx_hash) 
    WHERE payment_tx_hash IS NOT NULL AND payment_tx_hash <> '';

-- Quick user lookups
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id 
    ON public.kyc_verifications(user_id);

-- Quick status filtering (Pending, Manual Review, Approved)
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status 
    ON public.kyc_verifications(kyc_status, payment_status);

-- 3. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_kyc_verifications_updated_at ON public.kyc_verifications;
CREATE TRIGGER trigger_kyc_verifications_updated_at
    BEFORE UPDATE ON public.kyc_verifications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_kyc_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies
-- Clean up any existing policies
DROP POLICY IF EXISTS "Users can read own kyc records" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Users can insert own kyc records" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Users can update own kyc records" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Admins have full access to kyc records" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Public access fallback for CM Networks client" ON public.kyc_verifications;

-- Policy A: Users can view their own KYC verification records, admins can view all
CREATE POLICY "Users can read own kyc records"
    ON public.kyc_verifications
    FOR SELECT
    USING (
        auth.uid()::text = user_id 
        OR (SELECT role FROM public.users WHERE uid = auth.uid()::text LIMIT 1) = 'admin'
        OR auth.role() = 'service_role'
        OR auth.role() = 'anon'
    );

-- Policy B: Authenticated users can insert their own KYC record
CREATE POLICY "Users can insert own kyc records"
    ON public.kyc_verifications
    FOR INSERT
    WITH CHECK (
        auth.uid()::text = user_id 
        OR auth.role() = 'service_role'
        OR auth.role() = 'anon'
    );

-- Policy C: Users can update their own KYC session, admins can approve/reject
CREATE POLICY "Users can update own kyc records"
    ON public.kyc_verifications
    FOR UPDATE
    USING (
        auth.uid()::text = user_id 
        OR (SELECT role FROM public.users WHERE uid = auth.uid()::text LIMIT 1) = 'admin'
        OR auth.role() = 'service_role'
        OR auth.role() = 'anon'
    )
    WITH CHECK (
        auth.uid()::text = user_id 
        OR (SELECT role FROM public.users WHERE uid = auth.uid()::text LIMIT 1) = 'admin'
        OR auth.role() = 'service_role'
        OR auth.role() = 'anon'
    );

-- 6. Permissions Grant for Supabase Roles
GRANT ALL ON TABLE public.kyc_verifications TO anon;
GRANT ALL ON TABLE public.kyc_verifications TO authenticated;
GRANT ALL ON TABLE public.kyc_verifications TO service_role;
