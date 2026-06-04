-- Run this query once in your Supabase SQL Editor.
-- It creates a function to successfully link legacy users (like their referrals and CM coins) 
-- to their new Supabase Google accounts based on their email.

-- 1. Drop the constraints holding back UID changes
ALTER TABLE public."completedTasks" DROP CONSTRAINT IF EXISTS "completedTasks_userId_fkey";
ALTER TABLE public."taskClaims" DROP CONSTRAINT IF EXISTS "taskClaims_userId_fkey";

-- 2. Create the linking function
CREATE OR REPLACE FUNCTION link_legacy_account(user_email text, new_user_id text)
RETURNS boolean AS $$
DECLARE
  legacy_uid text;
  existing_new_uid text;
BEGIN
  -- Find the old user by email using its firebase id
  SELECT uid INTO legacy_uid FROM public.users WHERE email = user_email AND uid != new_user_id LIMIT 1;
  
  IF legacy_uid IS NOT NULL THEN
    
    -- Check if the frontend accidentally already created a "blank/new" user row for the new Supabase ID when logging in
    SELECT uid INTO existing_new_uid FROM public.users WHERE uid = new_user_id;

    IF existing_new_uid IS NOT NULL THEN
      -- Delete the new blank user first so there's no PK conflict
      DELETE FROM public.users WHERE uid = new_user_id;
    END IF;

    -- Update everything from the old legacy_uid to point to the new_user_id
    UPDATE public.transactions SET "senderUid" = new_user_id WHERE "senderUid" = legacy_uid;
    UPDATE public.transactions SET "receiverUid" = new_user_id WHERE "receiverUid" = legacy_uid;
    UPDATE public.withdrawals SET "userId" = new_user_id WHERE "userId" = legacy_uid;
    UPDATE public.withdrawals_usdt SET "userId" = new_user_id WHERE "userId" = legacy_uid;
    UPDATE public.ads_log SET "userId" = new_user_id WHERE "userId" = legacy_uid;
    UPDATE public."completedTasks" SET "userId" = new_user_id WHERE "userId" = legacy_uid;
    UPDATE public."taskClaims" SET "userId" = new_user_id WHERE "userId" = legacy_uid;
    
    -- Once all relations point correctly, rename the actual record!
    UPDATE public.users SET uid = new_user_id WHERE uid = legacy_uid;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
