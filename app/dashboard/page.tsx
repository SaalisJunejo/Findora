"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/db/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email ?? "");
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center">
        <p className="text-neutral-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Dashboard
        </h1>
        <p className="mt-1 text-neutral-500">
          Signed in as{" "}
          <span className="font-medium text-neutral-700">{userEmail}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/report-case"
          className="group rounded-xl border border-neutral-200 p-6 transition-all hover:border-neutral-400 hover:shadow-sm"
        >
          <h2 className="text-lg font-semibold text-neutral-900 group-hover:text-neutral-700">
            Report Missing Person
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Create a new case with a photo, description, and last-seen details.
          </p>
        </Link>

        <Link
          href="/report-sighting"
          className="group rounded-xl border border-neutral-200 p-6 transition-all hover:border-neutral-400 hover:shadow-sm"
        >
          <h2 className="text-lg font-semibold text-neutral-900 group-hover:text-neutral-700">
            Report a Sighting
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Upload a photo and mark the location where you spotted someone.
          </p>
        </Link>
      </div>
    </main>
  );
}
