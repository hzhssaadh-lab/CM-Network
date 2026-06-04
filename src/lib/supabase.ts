import { createClient } from '@supabase/supabase-js';

// User provided Supabase Config
const supabaseUrl = 'https://esyqgfybykbjbjagwkcs.supabase.co';
const supabaseAnonKey = 'sb_publishable_ga39dSKPwJvJBsQppSQC9g_s0kPELWg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
