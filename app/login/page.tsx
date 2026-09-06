"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/db/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-700"
          >
            &larr; Back to Findora
          </Link>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Log in
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Welcome back. Enter your credentials to continue.
            </p>
          </div>

          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-neutral-700"
            >
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-neutral-700"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-neutral-900 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
