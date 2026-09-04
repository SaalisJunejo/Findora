import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example)."
  );
}

/**
 * Shared Supabase client using the public anon key.
 *
 * Safe to import from both client and server code — row-level security (RLS)
 * in the database is what actually enforces access (docs/PRD.md §8).
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);
