import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'ExamGrid: Supabase env vars are missing (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). ' +
    'Data will fall back to localStorage only.'
  );
}

// createClient is safe to call even with empty strings — it will just fail on requests.
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
