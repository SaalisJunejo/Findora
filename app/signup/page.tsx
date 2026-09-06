"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/db/supabase";

// DEMO MODE: OTP is mocked and shown on-screen instead of sent via email, for hackathon demo reliability.

type Step = "email" | "code" | "password";

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Generate a random 6-digit code and display it on screen
  function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }
    // DEMO MODE: OTP is mocked and shown on-screen instead of sent via email, for hackathon demo reliability.
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setError("");
    setStep("code");
  }

  // Step 2: Verify the entered code matches the generated one
  function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (enteredCode !== generatedCode) {
      setError("Code does not match. Please try again.");
      return;
    }
    setError("");
    setStep("password");
  }

  // Step 3: Create account via API, then sign in and redirect
  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the account via the server-side admin API (bypasses email confirmation)
      const createRes = await fetch("/api/create-demo-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        setError(createData.error || "Failed to create account.");
        return;
      }

      // 2. Sign in the newly created user with their credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Account created but sign-in failed: " + signInError.message);
        return;
      }

      // 3. Redirect to dashboard
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

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
          <span className={step === "email" ? "font-semibold text-neutral-900" : ""}>
            Email
          </span>
          <span>&mdash;</span>
          <span className={step === "code" ? "font-semibold text-neutral-900" : ""}>
            Verify
          </span>
          <span>&mdash;</span>
          <span className={step === "password" ? "font-semibold text-neutral-900" : ""}>
            Password
          </span>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Enter your email to get started.
              </p>
            </div>
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-neutral-700"
              >
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
            >
              Send code
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Verify your email
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Enter the 6-digit code sent to <strong>{email}</strong>.
              </p>
            </div>

            {/* DEMO MODE: OTP is mocked and shown on-screen instead of sent via email, for hackathon demo reliability. */}
            <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-600">
                Demo Mode &mdash; Your verification code:
              </p>
              <p className="mt-2 text-3xl font-bold tracking-widest text-amber-800">
                {generatedCode}
              </p>
            </div>

            <div>
              <label
                htmlFor="otp-code"
                className="block text-sm font-medium text-neutral-700"
              >
                Enter code
              </label>
              <input
                id="otp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={enteredCode}
                onChange={(e) =>
                  setEnteredCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
                required
                autoFocus
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-center text-lg tracking-[0.5em] shadow-sm transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
            >
              Verify code
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setEnteredCode("");
                setError("");
              }}
              className="w-full text-sm text-neutral-500 transition-colors hover:text-neutral-700"
            >
              &larr; Use a different email
            </button>
          </form>
        )}

        {/* Step 3: Set Password */}
        {step === "password" && (
          <form onSubmit={handleCreateAccount} className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Set your password
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Create a password for <strong>{email}</strong>.
              </p>
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-neutral-700"
              >
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                autoFocus
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-sm font-medium text-neutral-700"
              >
                Confirm password
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}

        {/* Footer link */}
        <p className="text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-neutral-900 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
