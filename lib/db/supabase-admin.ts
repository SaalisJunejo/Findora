/**
 * Supabase admin client using the service role key.
 *
 * IMPORTANT: This client bypasses RLS and should ONLY be used server-side
 * (in API routes or server actions). Never expose the service role key
 * to the client or use this client in browser code.
 *
 * Use cases:
 * - Creating users programmatically via Admin API
 * - Bypassing RLS for trusted server operations
 *
 * The client is lazily initialized on first call to avoid build-time errors
 * when the SUPABASE_SERVICE_ROLE_KEY env var is not yet configured.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _adminClient: SupabaseClient | null = null;

/**
 * Get the Supabase admin client (server-side only).
 * Throws at runtime if SUPABASE_SERVICE_ROLE_KEY is not configured.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase admin configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  _adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _adminClient;
}
