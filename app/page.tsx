import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center gap-16 px-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-6xl font-bold tracking-tight text-neutral-900">
          Findora
        </h1>
        <p className="mt-4 max-w-md text-lg text-neutral-600">
          AI-assisted matching to help reunite missing persons with their
          families.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/report-case"
          className="rounded-lg bg-neutral-900 px-8 py-3 text-center font-medium text-white transition-colors hover:bg-neutral-700"
        >
          Report Missing Person
        </Link>
        <Link
          href="/report-sighting"
          className="rounded-lg border border-neutral-300 px-8 py-3 text-center font-medium text-neutral-900 transition-colors hover:border-neutral-500"
        >
          Report a Sighting
        </Link>
      </div>

      <p className="text-sm text-neutral-500">
        Already using Findora?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-900 hover:underline"
        >
          Log in
        </Link>
        {" or "}
        <Link
          href="/signup"
          className="font-medium text-neutral-900 hover:underline"
        >
          sign up
        </Link>
      </p>
    </main>
  );
}
