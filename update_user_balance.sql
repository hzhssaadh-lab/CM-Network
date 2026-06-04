-- Supabase SQL Stored Procedure to update user balance safely
-- Copy and paste this into the Supabase SQL Editor and click "Run"

CREATE OR REPLACE FUNCTION update_user_balance(
  p_user_id text,
  p_amount numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to ensure the update succeeds
AS $$
DECLARE
  v_current_balance numeric;
BEGIN
  -- 1. Lock the row to prevent concurrent updates (safe transaction)
  SELECT balance INTO v_current_balance
  FROM users
  WHERE uid = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found.';
  END IF;

  -- 2. Check if the resulting balance would be negative
  IF (v_current_balance + p_amount) < 0 THEN
    RAISE EXCEPTION 'Insufficient balance: Amount cannot fall below zero.';
  END IF;

  -- 3. Perform the update
  UPDATE users
  SET balance = balance + p_amount
  WHERE uid = p_user_id;

END;
$$;
