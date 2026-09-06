/**
 * Auth helpers for Findora.
 *
 * Session utilities — check login state and get the current user.
 * See session.ts for getUser(), isAuthenticated(), getUserId().
 *
 * Signup flow (docs/PRD.md §2.3):
 * - Sign up: email + one-time OTP verification (mocked for demo), then set a password.
 * - All subsequent logins: email + password (no repeated OTP).
 */
export { getUser, isAuthenticated, getUserId } from "./session";
