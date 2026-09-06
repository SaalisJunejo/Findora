/**
 * Session helper for checking authentication state.
 *
 * Provides utilities to check if a user is logged in and retrieve their ID.
 * These functions work in both Server Components (via cookies) and
 * Client Components (via browser session).
 */

import { supabase } from "@/lib/db/supabase";

/**
 * Get the current user from the active session.
 * Returns null if no user is logged in.
 */
export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Check if a user is currently authenticated.
 * Returns true if logged in, false otherwise.
 */
export async function isAuthenticated() {
  const user = await getUser();
  return user !== null;
}

/**
 * Get the current user's ID.
 * Returns null if no user is logged in.
 */
export async function getUserId() {
  const user = await getUser();
  return user?.id ?? null;
}
