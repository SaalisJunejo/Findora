"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/db/supabase";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth state on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth state changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-neutral-900">
          Findora
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-neutral-600 hover:text-neutral-900">
            Home
          </Link>

          {loading ? (
            <span className="text-neutral-400">Loading...</span>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-neutral-600 hover:text-neutral-900"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-neutral-300 px-4 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-neutral-600 hover:text-neutral-900"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-neutral-900 px-4 py-1.5 text-white transition-colors hover:bg-neutral-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
